const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const logger = require('../utils/logger');
const { logError } = require('./logger');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug('🔐 Token decoded', { userId: decoded.id, role: decoded.role });
    
    // ✅ FIXED: Use decoded.id (not decoded._id)
    if (decoded.role === 'admin' || decoded.role === 'super_admin') {
      req.user = await Admin.findById(decoded.id);
      if (!req.user) {
        logger.warn('Admin not found in database', { adminId: decoded.id });
      }
    } else {
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        logger.warn('User not found in database', { userId: decoded.id });
      }
    }

    if (!req.user) {
      logger.warn('❌ User not found in database', { userId: decoded.id, role: decoded.role });
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.debug('✅ Auth successful', { 
      userId: req.user._id || req.user.id, 
      email: req.user.email,
      role: req.user.role 
    });
    next();
  } catch (err) {
    logError(err, {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};