const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { logEvent } = require('../middleware/logger');

// Connection state tracking
let connectionState = {
  isConnected: false,
  isConnecting: false,
  retryCount: 0,
  maxRetries: 10,
  lastError: null
};

// Connection options - optimized for MongoDB Atlas (cloud)
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30s for Atlas network latency
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 30000, // 30s to establish connection
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2, // Maintain at least 2 socket connections
  retryWrites: true, // Enable retryable writes
  w: 'majority' // Write concern
};

/**
 * Attempt to connect to MongoDB
 * @returns {Promise<boolean>} - Returns true if connected, false otherwise
 */
const attemptConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);

    connectionState.isConnected = true;
    connectionState.isConnecting = false;
    connectionState.retryCount = 0;
    connectionState.lastError = null;

    logger.info('✅ MongoDB Connected', {
      host: conn.connection.host,
      database: conn.connection.name
    });

    // Log to database (if possible)
    try {
      logEvent('info', 'Database connection established', {
        host: conn.connection.host,
        database: conn.connection.name
      });
    } catch (logError) {
      // Ignore log errors if DB isn't ready
      logger.warn('Could not log to database (expected on first connection)');
    }

    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', { error: err.message });
      connectionState.isConnected = false;
      connectionState.lastError = err.message;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      connectionState.isConnected = false;
      // Attempt to reconnect
      if (!connectionState.isConnecting) {
        connectDB();
      }
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      connectionState.isConnected = true;
      connectionState.lastError = null;
    });

    return true;
  } catch (error) {
    connectionState.isConnected = false;
    connectionState.lastError = error.message;
    logger.error('❌ MongoDB connection attempt failed', {
      error: error.message,
      attempt: connectionState.retryCount + 1,
      maxAttempts: connectionState.maxRetries
    });
    return false;
  }
};

/**
 * Connect to MongoDB with retry logic
 * Uses exponential backoff for retries
 */
const connectDB = async () => {
  if (connectionState.isConnecting) {
    logger.info('MongoDB connection already in progress...');
    return;
  }

  if (connectionState.isConnected) {
    logger.info('MongoDB already connected');
    return;
  }

  connectionState.isConnecting = true;

  // Try initial connection
  const connected = await attemptConnection();

  if (connected) {
    connectionState.isConnecting = false;
    return;
  }

  // Retry logic with exponential backoff
  while (connectionState.retryCount < connectionState.maxRetries) {
    connectionState.retryCount++;
    
    // Exponential backoff: 5s, 10s, 20s, 40s, etc. (capped at 60s)
    const delay = Math.min(5000 * Math.pow(2, connectionState.retryCount - 1), 60000);
    
    logger.warn(`Retrying MongoDB connection in ${delay / 1000}s... (Attempt ${connectionState.retryCount}/${connectionState.maxRetries})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));

    const connected = await attemptConnection();
    if (connected) {
      connectionState.isConnecting = false;
      return;
    }
  }

  // Max retries reached
  connectionState.isConnecting = false;
  logger.error('❌ MongoDB connection failed after maximum retries', {
    attempts: connectionState.maxRetries,
    error: connectionState.lastError
  });
  
  // Don't exit - allow server to run and respond with 503 for DB-dependent routes
  logger.warn('⚠️  Server will continue running but database-dependent routes will return errors');
};

/**
 * Get current connection state
 * @returns {object} - Connection state object
 */
const getConnectionState = () => {
  return {
    isConnected: connectionState.isConnected || mongoose.connection.readyState === 1,
    isConnecting: connectionState.isConnecting,
    retryCount: connectionState.retryCount,
    lastError: connectionState.lastError,
    readyState: mongoose.connection.readyState // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  };
};

/**
 * Check if database is connected
 * @returns {boolean}
 */
const isConnected = () => {
  return connectionState.isConnected || mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  getConnectionState,
  isConnected
};