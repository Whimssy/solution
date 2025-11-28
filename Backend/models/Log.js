const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    index: true
  },
  message: {
    type: String,
    required: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // HTTP request specific fields
  request: {
    method: String,
    url: String,
    path: String,
    query: mongoose.Schema.Types.Mixed,
    params: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String
  },
  response: {
    statusCode: Number,
    statusMessage: String,
    responseTime: Number // in milliseconds
  },
  // User context
  user: {
    id: mongoose.Schema.Types.ObjectId,
    email: String,
    role: String
  },
  // Error specific fields
  error: {
    name: String,
    message: String,
    stack: String
  },
  // Service context
  service: {
    type: String,
    default: 'madeasy-backend'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
LogSchema.index({ level: 1, timestamp: -1 }); // Compound index for level + time queries
LogSchema.index({ timestamp: -1 }); // Single field index for time-based queries
LogSchema.index({ 'user.id': 1, timestamp: -1 }); // Compound index for user logs
LogSchema.index({ 'request.path': 1, timestamp: -1 }); // Compound index for endpoint queries
LogSchema.index({ 'response.statusCode': 1, timestamp: -1 }); // Compound index for status code queries
LogSchema.index({ level: 1, 'user.id': 1, timestamp: -1 }); // Compound index for user-specific log level queries

// Auto-delete logs older than retention period (configurable via env)
// Default: 90 days. Set LOG_RETENTION_DAYS to override.
const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 90;
const retentionSeconds = retentionDays * 24 * 60 * 60; // Convert days to seconds

// TTL index will automatically delete documents after retention period
LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: retentionSeconds });

module.exports = mongoose.model('Log', LogSchema);

