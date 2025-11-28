const Admin = require('../models/Admin');
const User = require('../models/User');
const Cleaner = require('../models/Cleaner');
const Booking = require('../models/Booking');
const Log = require('../models/Log');
const asyncHandler = require('../middleware/asyncHandler');
const { logEvent } = require('../middleware/logger');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Create token (using same JWT method as users)
  const token = require('jsonwebtoken').sign(
    { id: admin._id, role: admin.role || 'admin' }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalCleaners = await Cleaner.countDocuments({ isVerified: true });
  const pendingCleaners = await User.countDocuments({ 'cleanerApplication.status': 'pending' });
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({ status: 'pending' });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalCleaners,
      pendingCleaners,
      totalBookings,
      pendingBookings
    }
  });
});

// @desc    Get pending cleaner applications
// @route   GET /api/admin/cleaners/pending
// @access  Private/Admin
exports.getPendingCleaners = asyncHandler(async (req, res, next) => {
  const pendingCleaners = await User.find({ 
    'cleanerApplication.status': 'pending' 
  }).select('name email phone profilePhoto cleanerApplication');

  res.status(200).json({
    success: true,
    count: pendingCleaners.length,
    data: pendingCleaners
  });
});

// @desc    Review cleaner application
// @route   PUT /api/admin/cleaners/:id/review
// @access  Private/Admin
exports.reviewCleaner = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.cleanerApplication.status = status;
  user.cleanerApplication.reviewedAt = new Date();
  user.cleanerApplication.reviewedBy = req.user.id;
  
  if (status === 'rejected') {
    user.cleanerApplication.rejectionReason = rejectionReason;
  } else if (status === 'approved') {
    user.role = 'cleaner';
    // Create or update cleaner profile
    await Cleaner.findOneAndUpdate(
      { user: user._id },
      { 
        user: user._id,
        isVerified: true,
        verificationDate: new Date()
      },
      { upsert: true, new: true }
    );
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: `Cleaner application ${status}`,
    data: user
  });
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (startDate || endDate) {
    query['schedule.date'] = {};
    if (startDate) {
      query['schedule.date'].$gte = new Date(startDate);
    }
    if (endDate) {
      query['schedule.date'].$lte = new Date(endDate);
    }
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get bookings with populated user and cleaner data
  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('cleaner', 'user')
    .populate({
      path: 'cleaner',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count
  const total = await Booking.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: bookings
  });
});

// @desc    Get all logs with filters
// @route   GET /api/admin/logs
// @access  Private/Super Admin only
exports.getLogs = asyncHandler(async (req, res, next) => {
  const {
    level,
    startDate,
    endDate,
    userId,
    path,
    statusCode,
    page = 1,
    limit = 50,
    search
  } = req.query;

  // Build query
  const query = {};

  // Filter by log level
  if (level) {
    query.level = level;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  // Filter by user ID
  if (userId) {
    query['user.id'] = userId;
  }

  // Filter by request path
  if (path) {
    query['request.path'] = { $regex: path, $options: 'i' };
  }

  // Filter by status code
  if (statusCode) {
    query['response.statusCode'] = parseInt(statusCode);
  }

  // Search in message
  if (search) {
    query.message = { $regex: search, $options: 'i' };
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get logs
  const logs = await Log.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count
  const total = await Log.countDocuments(query);

  // Get log statistics
  const stats = await Log.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    }
  ]);

  // Log the access
  logEvent('info', 'Admin accessed logs', {
    adminId: req.user.id,
    adminEmail: req.user.email,
    filters: { level, startDate, endDate, userId, path, statusCode, search }
  });

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    stats: stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    data: logs
  });
});

// @desc    Get log statistics
// @route   GET /api/admin/logs/stats
// @access  Private/Super Admin only
exports.getLogStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.timestamp = {};
    if (startDate) {
      dateFilter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.timestamp.$lte = new Date(endDate);
    }
  }

  // Get statistics by level
  const statsByLevel = await Log.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get statistics by status code
  const statsByStatusCode = await Log.aggregate([
    { $match: { ...dateFilter, 'response.statusCode': { $exists: true } } },
    {
      $group: {
        _id: {
          $cond: [
            { $gte: ['$response.statusCode', 500] },
            '5xx',
            {
              $cond: [
                { $gte: ['$response.statusCode', 400] },
                '4xx',
                {
                  $cond: [
                    { $gte: ['$response.statusCode', 300] },
                    '3xx',
                    '2xx'
                  ]
                }
              ]
            }
          ]
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get top endpoints
  const topEndpoints = await Log.aggregate([
    { $match: { ...dateFilter, 'request.path': { $exists: true } } },
    {
      $group: {
        _id: '$request.path',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$response.responseTime' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get errors in last 24 hours
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  const recentErrors = await Log.countDocuments({
    level: 'error',
    timestamp: { $gte: last24Hours }
  });

  // Get total logs count
  const totalLogs = await Log.countDocuments(dateFilter);

  res.status(200).json({
    success: true,
    data: {
      totalLogs,
      recentErrors,
      statsByLevel: statsByLevel.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      statsByStatusCode: statsByStatusCode.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      topEndpoints
    }
  });
});

// @desc    Get a specific log by ID
// @route   GET /api/admin/logs/:id
// @access  Private/Super Admin only
exports.getLogById = asyncHandler(async (req, res, next) => {
  const log = await Log.findById(req.params.id);

  if (!log) {
    return res.status(404).json({
      success: false,
      message: 'Log not found'
    });
  }

  res.status(200).json({
    success: true,
    data: log
  });
});

// @desc    Delete logs (bulk delete with filters)
// @route   DELETE /api/admin/logs
// @access  Private/Super Admin only
exports.deleteLogs = asyncHandler(async (req, res, next) => {
  const { level, startDate, endDate, olderThan } = req.query;

  const query = {};

  if (level) {
    query.level = level;
  }

  if (olderThan) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan));
    query.timestamp = { $lt: cutoffDate };
  } else if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  const result = await Log.deleteMany(query);

  // Log the deletion
  logEvent('info', 'Admin deleted logs', {
    adminId: req.user.id,
    adminEmail: req.user.email,
    deletedCount: result.deletedCount,
    filters: { level, startDate, endDate, olderThan }
  });

  res.status(200).json({
    success: true,
    message: `Successfully deleted ${result.deletedCount} log(s)`,
    deletedCount: result.deletedCount
  });
});