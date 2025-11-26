const express = require('express');
const router = express.Router();

// @desc    Test auth route
// @route   GET /api/auth
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth route is working!'
  });
});

module.exports = router;