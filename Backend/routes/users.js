const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUserBookings } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, getProfile);

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
router.put('/me', protect, updateProfile);

// @desc    Get user's bookings
// @route   GET /api/users/me/bookings
// @access  Private
router.get('/me/bookings', protect, getUserBookings);

// @desc    Test users route
// @route   GET /api/users
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Users route is working!'
  });
});

module.exports = router;