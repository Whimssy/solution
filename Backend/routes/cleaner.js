const express = require('express');
const router = express.Router();
const {
  getCleaners,
  getCleanerById,
  getCleanerBookings,
  applyAsCleaner,
  updateCleanerProfile
} = require('../controllers/cleanerController');
const { protect, authorize } = require('../middleware/auth');

// @desc    List/search cleaners
// @route   GET /api/cleaners
// @access  Public
router.get('/', getCleaners);

// @desc    Apply to become cleaner
// @route   POST /api/cleaners/apply
// @access  Private/User
router.post('/apply', protect, authorize('user'), applyAsCleaner);

// @desc    Get cleaner's bookings
// @route   GET /api/cleaners/me/bookings
// @access  Private/Cleaner
router.get('/me/bookings', protect, authorize('cleaner'), getCleanerBookings);

// @desc    Update cleaner profile
// @route   PUT /api/cleaners/me
// @access  Private/Cleaner
router.put('/me', protect, authorize('cleaner'), updateCleanerProfile);

// @desc    Get cleaner profile
// @route   GET /api/cleaners/:id
// @access  Public
router.get('/:id', getCleanerById);

module.exports = router;