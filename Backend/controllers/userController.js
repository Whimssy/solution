const User = require('../models/User');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    profilePhoto: req.body.profilePhoto
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Get user's bookings
// @route   GET /api/users/me/bookings
// @access  Private
exports.getUserBookings = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  
  const query = { user: req.user.id };
  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate('cleaner', 'user')
    .populate({
      path: 'cleaner',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    })
    .sort({ createdAt: -1 })
    .maxTimeMS(20000); // 20 second timeout for query

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});


