const express = require('express');
const router = express.Router();

// @desc    Test bookings route
// @route   GET /api/bookings
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bookings route is working!'
  });
});

module.exports = router;