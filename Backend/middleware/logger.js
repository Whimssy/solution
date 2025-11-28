const logger = require('../utils/logger');
const Log = require('../models/Log');

// Middleware to log HTTP requests and responses
const requestLogger = async (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Capture response data
  res.send = function (data) {
    res.send = originalSend;
    const responseTime = Date.now() - startTime;

    // Extract user info if available
    const userInfo = req.user ? {
      id: req.user._id || req.user.id,
      email: req.user.email,
      role: req.user.role
    } : null;

    // Determine log level based on status code
    let logLevel = 'info';
    if (res.statusCode >= 500) {
      logLevel = 'error';
    } else if (res.statusCode >= 400) {
      logLevel = 'warn';
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      logLevel = 'info';
    }

    // Create log entry
    const logEntry = {
      level: logLevel,
      message: `${req.method} ${req.path} - ${res.statusCode}`,
      timestamp: new Date(),
      request: {
        method: req.method,
        url: req.originalUrl || req.url,
        path: req.path,
        query: req.query,
        params: req.params,
        headers: {
          'user-agent': req.get('user-agent'),
          'content-type': req.get('content-type'),
          'authorization': req.get('authorization') ? 'Bearer ***' : undefined
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      },
      response: {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        responseTime
      },
      service: 'madeasy-backend'
    };

    if (userInfo) {
      logEntry.user = userInfo;
    }

    // Log to Winston (file/console)
    logger.log(logLevel, logEntry.message, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      userId: userInfo?.id,
      ip: req.ip
    });

    // Save to MongoDB asynchronously (don't block response)
    Log.create(logEntry).catch(err => {
      logger.error('Failed to save log to database', { error: err.message });
    });

    return originalSend.call(this, data);
  };

  next();
};

// Helper function to log application events
const logEvent = async (level, message, context = {}) => {
  const logEntry = {
    level,
    message,
    meta: context,
    timestamp: new Date(),
    service: 'madeasy-backend'
  };

  // Log to Winston
  logger.log(level, message, context);

  // Save to MongoDB asynchronously
  Log.create(logEntry).catch(err => {
    logger.error('Failed to save log to database', { error: err.message });
  });
};

// Helper function to log errors
const logError = async (error, context = {}) => {
  const logEntry = {
    level: 'error',
    message: error.message || 'An error occurred',
    meta: context,
    timestamp: new Date(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    service: 'madeasy-backend'
  };

  // Log to Winston
  logger.error(error.message, {
    ...context,
    error: {
      name: error.name,
      stack: error.stack
    }
  });

  // Save to MongoDB asynchronously
  Log.create(logEntry).catch(err => {
    logger.error('Failed to save error log to database', { error: err.message });
  });
};

// Helper function to log debug info
const logDebug = async (message, context = {}) => {
  const logEntry = {
    level: 'debug',
    message,
    meta: context,
    timestamp: new Date(),
    service: 'madeasy-backend'
  };

  // Log to Winston
  logger.debug(message, context);

  // Save to MongoDB asynchronously
  Log.create(logEntry).catch(err => {
    logger.error('Failed to save debug log to database', { error: err.message });
  });
};

module.exports = {
  requestLogger,
  logEvent,
  logError,
  logDebug
};

