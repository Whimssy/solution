const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('./models/Admin');

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
    console.log('🔐 Decoded token:', decoded); // Debug log
    
    // ✅ FIXED: Use decoded.id (not decoded._id)
    if (decoded.role === 'admin' || decoded.role === 'super_admin') {
      req.user = await Admin.findById(decoded.id);
      console.log('👤 Found admin:', req.user ? req.user.email : 'Not found');
    } else {
      req.user = await User.findById(decoded.id);
      console.log('👤 Found user:', req.user ? req.user.email : 'Not found');
    }

    if (!req.user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Auth successful for:', req.user.email);
    next();
  } catch (err) {
    console.error('❌ JWT verification error:', err.message);
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