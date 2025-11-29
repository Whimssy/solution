const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getDashboardStats,
  getPendingCleaners,
  reviewCleaner,
  getAllBookings,
  getAllUsers,
  getLogs,
  getLogStats,
  getLogById,
  deleteLogs
} = require('../controllers/AdminControllers');
const { protect, authorize } = require('../middleware/auth');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
router.post('/login', adminLogin);

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin', 'super_admin'), getDashboardStats);

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin', 'super_admin'), getAllUsers);

// @desc    Get pending cleaner applications
// @route   GET /api/admin/cleaners/pending
// @access  Private/Admin
router.get('/cleaners/pending', protect, authorize('admin', 'super_admin'), getPendingCleaners);

// @desc    Review cleaner application
// @route   PUT /api/admin/cleaners/:id/review
// @access  Private/Admin
router.put('/cleaners/:id/review', protect, authorize('admin', 'super_admin'), reviewCleaner);

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/bookings', protect, authorize('admin', 'super_admin'), getAllBookings);

// @desc    Get all logs with filters
// @route   GET /api/admin/logs
// @access  Private/Super Admin only
router.get('/logs', protect, authorize('super_admin'), getLogs);

// @desc    Get log statistics
// @route   GET /api/admin/logs/stats
// @access  Private/Super Admin only
router.get('/logs/stats', protect, authorize('super_admin'), getLogStats);

// @desc    Get a specific log by ID
// @route   GET /api/admin/logs/:id
// @access  Private/Super Admin only
router.get('/logs/:id', protect, authorize('super_admin'), getLogById);

// @desc    Delete logs (bulk delete with filters)
// @route   DELETE /api/admin/logs
// @access  Private/Super Admin only
router.delete('/logs', protect, authorize('super_admin'), deleteLogs);

module.exports = router;