# URL Shortener Frontend

A responsive React application built with Material-UI for the URL Shortener service.

## Features

- **URL Shortener Page**: Create up to 5 short URLs at once with custom validation
- **Statistics Page**: View all created URLs with click analytics and history
- **Responsive Design**: Works on both desktop and mobile devices
- **Material-UI Components**: Clean, professional interface
- **Custom Logging**: Integrated with evaluation service logging middleware
- **Real-time Updates**: Refresh statistics and view detailed click history

## Pages

### URL Shortener (`/`)
- Input up to 5 URLs simultaneously
- Optional validity period (default: 30 minutes)
- Optional custom shortcodes
- Client-side validation for URL format and shortcode requirements
- Success/error feedback with copy-to-clipboard functionality

### URL Statistics (`/statistics`)
- Overview cards showing total URLs, clicks, and active URLs
- Expandable URL cards with detailed information
- Click history table with timestamp, referrer, user agent, and IP
- Real-time refresh capability

## Installation & Setup

```bash
npm install
npm start  # Runs on http://localhost:3000
```

## Technical Stack

- **React 18** - Frontend framework
- **Material-UI v5** - UI component library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Custom Logger** - Integrated logging middleware

## Responsive Design

- Mobile-first approach
- Breakpoints optimized for tablets and desktops
- Touch-friendly interface elements
- Accessible navigation and form controls

## API Integration

- Connects to backend service on `http://localhost:5000`
- Handles API errors gracefully with user-friendly messages
- Implements proper loading states and error boundaries

## Validation

- URL format validation (requires http/https protocol)
- Validity period validation (1-525600 minutes)
- Shortcode validation (3+ characters, alphanumeric, underscore, dash)
- Real-time form validation feedback