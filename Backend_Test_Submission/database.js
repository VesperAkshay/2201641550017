const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Log } = require('../Logging_Middleware/logger');

// Create database file path
const dbPath = path.join(__dirname, 'urlshortener.db');

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        await Log('backend', 'error', 'database', `Error opening database: ${err.message}`);
    } else {
        await Log('backend', 'info', 'database', 'Connected to SQLite database');
        initializeTables();
    }
});

// Initialize database tables
async function initializeTables() {
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
  `, async (err) => {
        if (err) {
            await Log('backend', 'error', 'database', `Error creating urls table: ${err.message}`);
        } else {
            await Log('backend', 'info', 'database', 'URLs table initialized');
        }
    });

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
  `, async (err) => {
        if (err) {
            await Log('backend', 'error', 'database', `Error creating clicks table: ${err.message}`);
        } else {
            await Log('backend', 'info', 'database', 'Clicks table initialized');
        }
    });
}

// Database operations
const urlDatabase = {
    // Check if shortcode exists
    has: (shortcode) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT shortcode FROM urls WHERE shortcode = ?', [shortcode], async (err, row) => {
                if (err) {
                    await Log('backend', 'error', 'database', `Error checking shortcode existence: ${err.message}`);
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    },

    // Get URL data by shortcode
    get: (shortcode) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM urls WHERE shortcode = ?', [shortcode], async (err, row) => {
                if (err) {
                    await Log('backend', 'error', 'database', `Error getting URL data: ${err.message}`);
                    reject(err);
                } else {
                    resolve(row ? {
                        originalUrl: row.original_url,
                        shortcode: row.shortcode,
                        createdAt: row.created_at,
                        expiryAt: row.expiry_at,
                        validity: row.validity,
                        clickCount: row.click_count
                    } : null);
                }
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
            ], async (err) => {
                if (err) {
                    await Log('backend', 'error', 'database', `Error setting URL data: ${err.message}`);
                    reject(err);
                } else {
                    await Log('backend', 'info', 'database', `URL data saved for shortcode: ${shortcode}`);
                    resolve();
                }
            });
        });
    },

    // Get all URLs
    entries: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM urls ORDER BY created_at DESC', [], async (err, rows) => {
                if (err) {
                    await Log('backend', 'error', 'database', `Error getting all URLs: ${err.message}`);
                    reject(err);
                } else {
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
            db.all('SELECT * FROM clicks WHERE shortcode = ? ORDER BY timestamp DESC', [shortcode], async (err, rows) => {
                if (err) {
                    await Log('backend', 'error', 'database', `Error getting clicks: ${err.message}`);
                    reject(err);
                } else {
                    resolve(rows || []);
                }
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
                ], async (err) => {
                    if (err) {
                        await Log('backend', 'error', 'database', `Error setting click data: ${err.message}`);
                        reject(err);
                    } else {
                        resolve();
                    }
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
            ], async (err) => {
                if (err) {
                    await Log('backend', 'error', 'database', `Error adding click: ${err.message}`);
                    reject(err);
                } else {
                    await Log('backend', 'info', 'database', `Click recorded for shortcode: ${shortcode}`);
                    resolve();
                }
            });
        });
    }
};

// Graceful shutdown
process.on('SIGINT', () => {
    db.close(async (err) => {
        if (err) {
            await Log('backend', 'error', 'database', `Error closing database: ${err.message}`);
        } else {
            await Log('backend', 'info', 'database', 'Database connection closed');
        }
        process.exit(0);
    });
});

module.exports = { urlDatabase, clickDatabase, db };