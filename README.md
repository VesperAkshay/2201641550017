# Campus Hiring Assessment - Full Stack URL Shortener

This repository contains the complete implementation of a URL Shortener microservice with frontend, backend, and custom logging middleware as per the campus hiring assessment requirements.

## Project Structure

```
├── Logging Middleware/     # Custom logging middleware
├── Backend Test Submission/    # Node.js/Express API server
├── Frontend Test Submission/   # React/Material-UI web app
├── Auth.txt               # Authentication credentials
├── Registration.txt       # Registration details
└── Assessment.md         # Original requirements
```

## Quick Start

### 1. Install Dependencies

```bash
# Install logging middleware
cd "Logging Middleware"
npm install

# Install backend dependencies
cd "../Backend Test Submission"
npm install

# Install frontend dependencies
cd "../Frontend Test Submission"
npm install
```

### 2. Start Services

```bash
# Terminal 1: Start Backend (Port 5000)
cd "Backend Test Submission"
npm run dev

# Terminal 2: Start Frontend (Port 3000)
cd "Frontend Test Submission"
npm start
```

### 3. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Features Implemented

### ✅ Logging Middleware
- Custom `Log(stack, level, pkg, message)` function
- Sends logs to evaluation service endpoint
- Used throughout both frontend and backend
- Graceful error handling

### ✅ Backend Microservice
- **POST /shorturls** - Create short URLs with optional custom shortcodes
- **GET /shorturls/:shortcode** - Get URL statistics and click history
- **GET /:shortcode** - Redirect to original URL (302)
- **GET /api/urls** - List all URLs for frontend
- Global unique shortcodes with collision detection
- Configurable validity periods (default: 30 minutes)
- Click tracking with referrer, user agent, and IP logging
- Comprehensive error handling and validation
- Rate limiting and security headers

### ✅ Frontend Application
- **URL Shortener Page**: Create up to 5 URLs simultaneously
- **Statistics Page**: View all URLs with detailed analytics
- Material-UI responsive design (mobile + desktop)
- Client-side validation for URLs, validity, and shortcodes
- Real-time click history and statistics
- Copy-to-clipboard and direct link opening
- Integrated custom logging throughout

## API Documentation

### Create Short URL
```bash
POST /shorturls
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "validity": 60,           # optional, minutes
  "shortcode": "mycode"     # optional, custom shortcode
}
```

### Get Statistics
```bash
GET /shorturls/mycode
```

### Redirect
```bash
GET /mycode  # 302 redirect to original URL
```

## Technical Implementation

### Backend Stack
- **Node.js + Express** - Web framework
- **express-validator** - Input validation
- **nanoid** - Unique shortcode generation
- **helmet** - Security headers
- **cors** - Cross-origin requests
- **express-rate-limit** - Rate limiting

### Frontend Stack
- **React 18** - UI framework
- **Material-UI v5** - Component library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client

### Security & Performance
- Input validation and sanitization
- Rate limiting (100 requests/15 minutes)
- Security headers via Helmet
- CORS configuration
- Error boundary handling
- Graceful logging failure handling

## Screenshots Required

### Backend Screenshots
- API request/response examples
- Performance timing screenshots
- Application running screenshots

### Frontend Screenshots
- Desktop view of URL shortener page
- Mobile view of URL shortener page
- Desktop view of statistics page
- Mobile view of statistics page

## Compliance Checklist

- ✅ Public GitHub repository with roll number as name
- ✅ Required folder structure maintained
- ✅ Custom logging middleware implemented and used exclusively
- ✅ No console.log or built-in logging used
- ✅ Production-level error handling
- ✅ Clean, commented code
- ✅ Material-UI for frontend styling
- ✅ Responsive design for mobile and desktop
- ✅ .gitignore for node_modules
- ✅ RESTful API design
- ✅ Global unique shortcodes
- ✅ Configurable validity periods
- ✅ Click tracking and analytics

## Development Notes

- All logging uses the custom middleware sending to evaluation service
- Backend runs on port 5000, frontend on port 3000
- In-memory storage used (replace with Redis/DB for production)
- Authentication credentials from registration included
- Comprehensive error handling with meaningful HTTP status codes