# Logging Middleware

Custom logging middleware for campus hiring assessment that sends logs to the evaluation service.

## Usage

```javascript
const { Log } = require('./logger');

// Log examples
await Log('backend', 'info', 'urlshortener', 'URL shortened successfully');
await Log('frontend', 'error', 'api', 'Failed to fetch URL statistics');
await Log('backend', 'warning', 'validation', 'Invalid shortcode provided');
```

## Parameters

- **stack**: "frontend" or "backend"
- **level**: "info", "warning", "debug", "error"
- **pkg**: logical part of your app ("urlshortener", "api", etc.)
- **message**: log details

## Installation

```bash
npm install
```

## Features

- Sends logs to evaluation service endpoint
- Includes authentication headers
- Graceful error handling (won't break app if logging fails)
- Timestamp and client ID automatically added