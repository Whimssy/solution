const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { logEvent } = require('../middleware/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('✅ MongoDB Connected', {
      host: conn.connection.host,
      database: conn.connection.name
    });

    // Log to database
    logEvent('info', 'Database connection established', {
      host: conn.connection.host,
      database: conn.connection.name
    });
    
  } catch (error) {
    logger.error('❌ MongoDB connection error', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

module.exports = connectDB;