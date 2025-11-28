const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

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
  res.status(200).json({
    success: true,
    message: '✅ Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cleaners', require('./routes/cleaner'));

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