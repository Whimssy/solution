// Import and initialize the Express app
const app = require('../Backend/server');

// For Vercel serverless, ensure database connection is initialized
// This will be called on cold start
const initializeServerless = async () => {
  try {
    const connectDB = require('../Backend/config/database');
    await connectDB();
  } catch (error) {
    // Log error but don't throw - let the middleware handle it
    console.error('Serverless DB initialization error:', error.message);
  }
};

// Initialize database connection for serverless (non-blocking)
if (process.env.VERCEL === '1') {
  initializeServerless().catch(() => {
    // Errors are handled by the middleware in server.js
  });
}

// Export the app for Vercel serverless
module.exports = app;

