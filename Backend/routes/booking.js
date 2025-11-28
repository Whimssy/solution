const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getCleanerBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private/User
router.post('/', protect, authorize('user'), createBooking);

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private/User
router.get('/', protect, authorize('user'), getUserBookings);

// @desc    Get cleaner's bookings
// @route   GET /api/bookings/cleaner
// @access  Private/Cleaner
router.get('/cleaner', protect, authorize('cleaner'), getCleanerBookings);

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, getBookingById);

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
router.put('/:id/status', protect, updateBookingStatus);

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;