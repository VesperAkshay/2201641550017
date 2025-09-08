const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Log } = require('../Logging_Middleware/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Import routes
const urlRoutes = require('./routes/urlRoutes');
app.use('/', urlRoutes);

// Global error handler
app.use((err, req, res, next) => {
  Log('backend', 'error', 'server', `Global error: ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  Log('backend', 'warning', 'server', `404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

app.listen(PORT, () => {
  Log('backend', 'info', 'server', `URL Shortener service started on port ${PORT}`);
});

module.exports = { app };