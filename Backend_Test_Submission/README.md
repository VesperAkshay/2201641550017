# URL Shortener Backend

A production-ready URL shortener microservice built with Node.js and Express.

## Features

- Create short URLs with auto-generated or custom shortcodes
- URL validation and expiry management
- Click tracking and analytics
- Rate limiting and security headers
- Custom logging middleware integration
- RESTful API design

## API Endpoints

### POST /shorturls
Create a new short URL

**Request Body:**
```json
{
  "url": "https://long.url/here",
  "validity": 30,            // optional, minutes (default: 30)
  "shortcode": "customCode"  // optional
}
```

**Response:**
```json
{
  "shortLink": "http://localhost:5000/customCode",
  "expiry": "2025-01-01T00:30:00Z"
}
```

### GET /shorturls/:shortcode
Get URL statistics

**Response:**
```json
{
  "shortcode": "customCode",
  "originalUrl": "https://long.url/here",
  "totalClicks": 5,
  "createdAt": "2025-01-01T00:00:00Z",
  "expiryAt": "2025-01-01T00:30:00Z",
  "clickHistory": [
    {
      "timestamp": "2025-01-01T00:05:00Z",
      "referrer": "Direct",
      "userAgent": "Mozilla/5.0...",
      "ip": "192.168.1.1"
    }
  ]
}
```

### GET /:shortcode
Redirect to original URL (302 redirect)

### GET /api/urls
Get all URLs (for frontend integration)

## Installation & Setup

```bash
npm install
npm run dev  # Development with nodemon
npm start    # Production
```

## Architecture

- **Express.js** - Web framework
- **In-memory storage** - URL and click data (use Redis/DB in production)
- **Rate limiting** - 100 requests per 15 minutes per IP
- **Security** - Helmet.js for security headers
- **Validation** - express-validator for input validation
- **Logging** - Custom middleware for evaluation service

## Error Handling

- 400: Validation errors
- 404: Shortcode not found
- 409: Shortcode already exists
- 410: URL expired
- 500: Internal server error