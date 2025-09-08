const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { nanoid } = require('nanoid');
const { Log } = require('../../Logging_Middleware/logger');
const { urlDatabase, clickDatabase } = require('../database');

const router = express.Router();

// Simple coarse location detection based on IP
function getCoarseLocation(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return 'Local/Private';
  }
  // In a real application, you would use a GeoIP service
  // For this demo, we'll return a generic location
  return 'Unknown Location';
}

// Validation middleware
const validateUrl = [
  body('url')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Invalid URL format'),
  body('validity')
    .optional()
    .isInt({ min: 1, max: 525600 })
    .withMessage('Validity must be between 1 and 525600 minutes'),
  body('shortcode')
    .optional()
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Shortcode must be 3-20 characters, alphanumeric, underscore, or dash only')
];

// POST /shorturls - Create short URL
router.post('/shorturls', validateUrl, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await Log('backend', 'warning', 'urlshortener', `Validation failed: ${JSON.stringify(errors.array())}`);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { url, validity = 30, shortcode } = req.body;
    
    // Generate or validate shortcode
    let finalShortcode;
    if (shortcode) {
      // Check if custom shortcode already exists
      if (urlDatabase.has(shortcode)) {
        await Log('backend', 'warning', 'urlshortener', `Shortcode already exists: ${shortcode}`);
        return res.status(409).json({
          error: 'Shortcode already exists',
          message: 'Please choose a different shortcode'
        });
      }
      finalShortcode = shortcode;
    } else {
      // Generate unique shortcode
      do {
        finalShortcode = nanoid(8);
      } while (urlDatabase.has(finalShortcode));
    }

    // Calculate expiry
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + validity);

    // Store URL data
    const urlData = {
      originalUrl: url,
      shortcode: finalShortcode,
      createdAt: new Date().toISOString(),
      expiryAt: expiryDate.toISOString(),
      validity: validity,
      clickCount: 0
    };

    urlDatabase.set(finalShortcode, urlData);
    clickDatabase.set(finalShortcode, []);

    const shortLink = `http://localhost:5000/${finalShortcode}`;
    
    await Log('backend', 'info', 'urlshortener', `URL shortened successfully: ${url} -> ${shortLink}`);

    res.status(201).json({
      shortLink,
      expiry: expiryDate.toISOString()
    });

  } catch (error) {
    await Log('backend', 'error', 'urlshortener', `Error creating short URL: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create short URL'
    });
  }
});

// GET /shorturls/:shortcode - Get URL statistics
router.get('/shorturls/:shortcode', [
  param('shortcode').isLength({ min: 3, max: 20 }).withMessage('Invalid shortcode format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await Log('backend', 'warning', 'urlshortener', `Invalid shortcode format: ${req.params.shortcode}`);
      return res.status(400).json({
        error: 'Invalid shortcode format',
        details: errors.array()
      });
    }

    const { shortcode } = req.params;
    const urlData = urlDatabase.get(shortcode);

    if (!urlData) {
      await Log('backend', 'warning', 'urlshortener', `Shortcode not found: ${shortcode}`);
      return res.status(404).json({
        error: 'Shortcode not found',
        message: 'The requested shortcode does not exist'
      });
    }

    // Check if expired
    if (new Date() > new Date(urlData.expiryAt)) {
      await Log('backend', 'warning', 'urlshortener', `Expired shortcode accessed: ${shortcode}`);
      return res.status(410).json({
        error: 'URL expired',
        message: 'This short URL has expired'
      });
    }

    const clickData = clickDatabase.get(shortcode) || [];
    
    await Log('backend', 'info', 'urlshortener', `Statistics retrieved for: ${shortcode}`);

    res.json({
      shortcode,
      originalUrl: urlData.originalUrl,
      totalClicks: urlData.clickCount,
      createdAt: urlData.createdAt,
      expiryAt: urlData.expiryAt,
      clickHistory: clickData.map(click => ({
        timestamp: click.timestamp,
        referrer: click.referrer || 'Direct',
        userAgent: click.userAgent || 'Unknown',
        ip: click.ip || 'Unknown',
        location: click.location || 'Unknown'
      }))
    });

  } catch (error) {
    await Log('backend', 'error', 'urlshortener', `Error retrieving statistics: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URL statistics'
    });
  }
});

// GET /:shortcode - Redirect to original URL
router.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    const urlData = urlDatabase.get(shortcode);

    if (!urlData) {
      await Log('backend', 'warning', 'urlshortener', `Redirect failed - shortcode not found: ${shortcode}`);
      return res.status(404).json({
        error: 'Shortcode not found',
        message: 'The requested shortcode does not exist'
      });
    }

    // Check if expired
    if (new Date() > new Date(urlData.expiryAt)) {
      await Log('backend', 'warning', 'urlshortener', `Redirect failed - expired shortcode: ${shortcode}`);
      return res.status(410).json({
        error: 'URL expired',
        message: 'This short URL has expired'
      });
    }

    // Record click
    const clickData = {
      timestamp: new Date().toISOString(),
      referrer: req.get('Referrer'),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      location: getCoarseLocation(req.ip || req.connection.remoteAddress)
    };

    const clicks = clickDatabase.get(shortcode) || [];
    clicks.push(clickData);
    clickDatabase.set(shortcode, clicks);

    // Update click count
    urlData.clickCount++;
    urlDatabase.set(shortcode, urlData);

    await Log('backend', 'info', 'urlshortener', `Redirect successful: ${shortcode} -> ${urlData.originalUrl}`);

    res.redirect(302, urlData.originalUrl);

  } catch (error) {
    await Log('backend', 'error', 'urlshortener', `Error during redirect: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to redirect'
    });
  }
});

// GET /api/urls - Get all URLs (for frontend)
router.get('/api/urls', async (req, res) => {
  try {
    const urls = Array.from(urlDatabase.entries()).map(([shortcode, data]) => ({
      shortcode,
      shortLink: `http://localhost:5000/${shortcode}`,
      originalUrl: data.originalUrl,
      totalClicks: data.clickCount,
      createdAt: data.createdAt,
      expiryAt: data.expiryAt,
      isExpired: new Date() > new Date(data.expiryAt)
    }));

    await Log('backend', 'info', 'api', `Retrieved ${urls.length} URLs`);
    res.json(urls);

  } catch (error) {
    await Log('backend', 'error', 'api', `Error retrieving URLs: ${error.message}`);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve URLs'
    });
  }
});

module.exports = router;