const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file path
const dbPath = path.join(__dirname, 'urlshortener.db');

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

// Initialize database tables
function initializeTables() {
  // URLs table
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      shortcode TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expiry_at TEXT NOT NULL,
      validity INTEGER NOT NULL,
      click_count INTEGER DEFAULT 0
    )
  `);

  // Clicks table
  db.run(`
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shortcode TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      ip TEXT,
      location TEXT,
      FOREIGN KEY (shortcode) REFERENCES urls (shortcode)
    )
  `);
}

// Database operations
const urlDatabase = {
  // Check if shortcode exists
  has: (shortcode) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT shortcode FROM urls WHERE shortcode = ?', [shortcode], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  },

  // Get URL data by shortcode
  get: (shortcode) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM urls WHERE shortcode = ?', [shortcode], (err, row) => {
        if (err) reject(err);
        else resolve(row ? {
          originalUrl: row.original_url,
          shortcode: row.shortcode,
          createdAt: row.created_at,
          expiryAt: row.expiry_at,
          validity: row.validity,
          clickCount: row.click_count
        } : null);
      });
    });
  },

  // Set URL data
  set: (shortcode, data) => {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT OR REPLACE INTO urls 
        (shortcode, original_url, created_at, expiry_at, validity, click_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        shortcode,
        data.originalUrl,
        data.createdAt,
        data.expiryAt,
        data.validity,
        data.clickCount || 0
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  // Get all URLs
  entries: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM urls ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else {
          const entries = rows.map(row => [row.shortcode, {
            originalUrl: row.original_url,
            shortcode: row.shortcode,
            createdAt: row.created_at,
            expiryAt: row.expiry_at,
            validity: row.validity,
            clickCount: row.click_count
          }]);
          resolve(entries);
        }
      });
    });
  }
};

const clickDatabase = {
  // Get clicks for a shortcode
  get: (shortcode) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM clicks WHERE shortcode = ? ORDER BY timestamp DESC', [shortcode], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  // Set/add click data
  set: (shortcode, clicks) => {
    return new Promise((resolve, reject) => {
      // For compatibility with existing code, we'll add the last click
      if (Array.isArray(clicks) && clicks.length > 0) {
        const lastClick = clicks[clicks.length - 1];
        db.run(`
          INSERT INTO clicks (shortcode, timestamp, referrer, user_agent, ip, location)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          shortcode,
          lastClick.timestamp,
          lastClick.referrer,
          lastClick.userAgent,
          lastClick.ip,
          lastClick.location
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  },

  // Add a single click
  addClick: (shortcode, clickData) => {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO clicks (shortcode, timestamp, referrer, user_agent, ip, location)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        shortcode,
        clickData.timestamp,
        clickData.referrer,
        clickData.userAgent,
        clickData.ip,
        clickData.location
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = { urlDatabase, clickDatabase, db };