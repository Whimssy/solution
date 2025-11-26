const express = require('express');
const router = express.Router();

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