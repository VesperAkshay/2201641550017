import axios from 'axios';

// Configuration from registration
const CLIENT_ID = 'fe89550b-038a-42ca-aaea-e33516de9062';
const CLIENT_SECRET = 'XfqBSHNqkcMUUNEx';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMjAxNjQxNTUwMDE3QHBzaXQuYWMuaW4iLCJleHAiOjE3NTczMTk4OTYsImlhdCI6MTc1NzMxODk5NiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjNjNzZjNzRjLWI2OTQtNDBiMi1hOGVlLTZkOGNiZmEzMjFlMSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImFrc2hheSBwYXRlbCIsInN1YiI6ImZlODk1NTBiLTAzOGEtNDJjYS1hYWVhLWUzMzUxNmRlOTA2MiJ9LCJlbWFpbCI6IjIyMDE2NDE1NTAwMTdAcHNpdC5hYy5pbiIsIm5hbWUiOiJha3NoYXkgcGF0ZWwiLCJyb2xsTm8iOiIyMjAxNjQxNTUwMDE3IiwiYWNjZXNzQ29kZSI6InNBV1R1UiIsImNsaWVudElEIjoiZmU4OTU1MGItMDM4YS00MmNhLWFhZWEtZTMzNTE2ZGU5MDYyIiwiY2xpZW50U2VjcmV0IjoiWGZxQlNITnFrY01VVU5FeCJ9.K1aimgy08nJgH9hQiAvku_-qxpJOGfO_cIas26nvpYo';
const LOG_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';

/**
 * Custom logging middleware function for frontend
 * @param {string} stack - "frontend" or "backend"
 * @param {string} level - "info", "warning", "debug", "error"
 * @param {string} pkg - logical part of your app ("urlshortener", "api", etc.)
 * @param {string} message - log details
 */
export async function Log(stack, level, pkg, message) {
  try {
    const logData = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      pkg: pkg.toLowerCase(),
      message: message,
      timestamp: new Date().toISOString(),
      clientID: CLIENT_ID
    };

    const response = await axios.post(LOG_ENDPOINT, logData, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Client-ID': CLIENT_ID,
        'X-Client-Secret': CLIENT_SECRET
      },
      timeout: 5000
    });

    return response.data;
  } catch (error) {
    // Fallback to console only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Logging failed:', error.message);
    }
    // Don't throw - logging failures shouldn't break the app
  }
}