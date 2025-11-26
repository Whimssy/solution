const Admin = require('./models/Admin');
const User = require('../models/User');
const Cleaner = require('../models/Cleaner');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');

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
    { id: admin._id, role: 'admin' }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE }
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
  }).populate('cleanerProfile');

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