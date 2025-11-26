const express = require('express');
const router = express.Router();

// @desc    Test cleaners route
// @route   GET /api/cleaners
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cleaners route is working!'
  });
});

module.exports = router;