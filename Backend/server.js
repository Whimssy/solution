const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import database connection
const { connectDB, getConnectionState, isConnected } = require('./config/database');

// Import logger
const logger = require('./utils/logger');
const { requestLogger, logEvent } = require('./middleware/logger');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Basic Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Request logging middleware (must be after morgan but before routes)
app.use(requestLogger);

// Database connection check middleware for database-dependent routes
const checkDatabaseConnection = (req, res, next) => {
  if (!isConnected()) {
    const dbState = getConnectionState();
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please check if MongoDB is running.',
      error: 'DATABASE_CONNECTION_ERROR',
      details: {
        isConnecting: dbState.isConnecting,
        lastError: dbState.lastError,
        retryCount: dbState.retryCount
      },
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// Test Routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Mamafua Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  const dbState = getConnectionState();
  res.status(200).json({
    success: true,
    message: '✅ Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbState.isConnected,
      status: dbState.isConnected ? 'connected' : 'disconnected',
      readyState: dbState.readyState
    }
  });
});

// Database health check endpoint
app.get('/api/health/db', (req, res) => {
  const dbState = getConnectionState();
  const status = dbState.isConnected ? 200 : 503;
  
  res.status(status).json({
    success: dbState.isConnected,
    message: dbState.isConnected 
      ? '✅ Database is connected' 
      : '❌ Database is not connected',
    timestamp: new Date().toISOString(),
    connection: {
      isConnected: dbState.isConnected,
      isConnecting: dbState.isConnecting,
      readyState: dbState.readyState,
      retryCount: dbState.retryCount,
      lastError: dbState.lastError
    }
  });
});

// ✅ API Routes
// Apply database check middleware to routes that require database
app.use('/api/auth', checkDatabaseConnection, require('./routes/auth'));
app.use('/api/admin', checkDatabaseConnection, require('./routes/admin'));
app.use('/api/bookings', checkDatabaseConnection, require('./routes/booking'));
app.use('/api/users', checkDatabaseConnection, require('./routes/users'));
app.use('/api/cleaners', checkDatabaseConnection, require('./routes/cleaner'));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info('🚀 MAMAFUA BACKEND SERVER STARTED', {
    port: PORT,
    environment: process.env.NODE_ENV,
    url: `http://localhost:${PORT}`
  });
  
  // Log server startup for admin panel
  logEvent('info', 'Server started', {
    port: PORT,
    environment: process.env.NODE_ENV
  });
});