const Booking = require('../models/Booking');
const Cleaner = require('../models/Cleaner');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = asyncHandler(async (req, res, next) => {
  // Explicit check: cleaners cannot book other cleaners
  if (req.user.role === 'cleaner') {
    return res.status(403).json({
      success: false,
      message: 'Cleaners cannot book other cleaners. Please use a regular user account to make bookings.'
    });
  }

  const {
    cleaner,
    serviceType,
    schedule,
    address,
    details,
    pricing
  } = req.body;

  // Validate required fields
  if (!cleaner || !serviceType || !schedule || !address || !pricing) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required booking information'
    });
  }

  // Verify cleaner exists and is available
  const cleanerDoc = await Cleaner.findById(cleaner)
    .populate('user', 'name email phone');

  if (!cleanerDoc) {
    return res.status(404).json({
      success: false,
      message: 'Cleaner not found'
    });
  }

  if (!cleanerDoc.isVerified) {
    return res.status(400).json({
      success: false,
      message: 'Cannot book with an unverified cleaner'
    });
  }

  if (!cleanerDoc.isAvailable) {
    return res.status(400).json({
      success: false,
      message: 'Cleaner is currently unavailable'
    });
  }

  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    cleaner,
    serviceType,
    schedule,
    address,
    details: details || {},
    pricing,
    status: 'pending',
    paymentStatus: 'pending'
  });

  // Populate for response
  await booking.populate({
    path: 'cleaner',
    populate: {
      path: 'user',
      select: 'name email phone'
    }
  });
  await booking.populate('user', 'name email phone');

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: booking
  });
});

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private/User
exports.getUserBookings = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  
  const query = { user: req.user.id };
  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate({
      path: 'cleaner',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    })
    .sort({ 'schedule.date': -1, createdAt: -1 })
    .maxTimeMS(20000); // 20 second timeout for query

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get cleaner's bookings
// @route   GET /api/bookings/cleaner
// @access  Private/Cleaner
exports.getCleanerBookings = asyncHandler(async (req, res, next) => {
  // Find cleaner profile for the authenticated user
  const cleaner = await Cleaner.findOne({ user: req.user.id });
  
  if (!cleaner) {
    return res.status(404).json({
      success: false,
      message: 'Cleaner profile not found'
    });
  }

  const { status } = req.query;
  const query = { cleaner: cleaner._id };
  
  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate({
      path: 'user',
      select: 'name email phone'
    })
    .sort({ 'schedule.date': 1, 'schedule.startTime': 1 })
    .maxTimeMS(20000); // 20 second timeout for query

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: 'cleaner',
      populate: {
        path: 'user',
        select: 'name email phone address'
      }
    })
    .populate('user', 'name email phone address');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check authorization - user can only access their own bookings
  // Cleaner can only access their assigned bookings
  // Admin can access all
  const isUser = booking.user._id.toString() === req.user.id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
  
  let isCleaner = false;
  if (req.user.role === 'cleaner') {
    const cleaner = await Cleaner.findOne({ user: req.user.id });
    if (cleaner && booking.cleaner._id.toString() === cleaner._id.toString()) {
      isCleaner = true;
    }
  }

  if (!isUser && !isAdmin && !isCleaner) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this booking'
    });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a status'
    });
  }

  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'payment_pending'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Authorization check
  const isUser = booking.user.toString() === req.user.id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
  
  let isCleaner = false;
  if (req.user.role === 'cleaner') {
    const cleaner = await Cleaner.findOne({ user: req.user.id });
    if (cleaner && booking.cleaner.toString() === cleaner._id.toString()) {
      isCleaner = true;
    }
  }

  if (!isUser && !isAdmin && !isCleaner) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this booking'
    });
  }

  // Update status
  booking.status = status;
  await booking.save();

  await booking.populate({
    path: 'cleaner',
    populate: {
      path: 'user',
      select: 'name email phone'
    }
  });
  await booking.populate('user', 'name email phone');

  res.status(200).json({
    success: true,
    message: 'Booking status updated',
    data: booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/User or Admin
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const { cancellationReason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Only user who made the booking or admin can cancel
  const isUser = booking.user.toString() === req.user.id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

  if (!isUser && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking'
    });
  }

  // Cannot cancel completed bookings
  if (booking.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel a completed booking'
    });
  }

  // Update booking
  booking.status = 'cancelled';
  if (cancellationReason) {
    booking.cancellationReason = cancellationReason;
  }
  await booking.save();

  await booking.populate({
    path: 'cleaner',
    populate: {
      path: 'user',
      select: 'name email phone'
    }
  });
  await booking.populate('user', 'name email phone');

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  });
});

