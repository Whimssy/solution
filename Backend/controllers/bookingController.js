const Booking = require('../models/Booking');
const User = require('../models/User');
const Cleaner = require('../models/Cleaner');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');
const { logEvent, logError } = require('../middleware/logger');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = asyncHandler(async (req, res, next) => {
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
      message: 'Please provide cleaner, serviceType, schedule, address, and pricing'
    });
  }

  // Verify cleaner exists and is verified
  const cleanerDoc = await Cleaner.findById(cleaner);
  if (!cleanerDoc) {
    return res.status(404).json({
      success: false,
      message: 'Cleaner not found'
    });
  }

  if (!cleanerDoc.isVerified) {
    return res.status(400).json({
      success: false,
      message: 'Cleaner is not verified'
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

  // Populate booking data
  await booking.populate('user', 'name email phone');
  await booking.populate({
    path: 'cleaner',
    populate: {
      path: 'user',
      select: 'name email phone'
    }
  });

  // Notify cleaner about new booking
  try {
    const cleanerUser = await User.findById(cleanerDoc.user);
    if (cleanerUser) {
      logger.info('📧 Notification: New booking created', {
        cleanerId: cleanerUser._id,
        cleanerName: cleanerUser.name,
        cleanerEmail: cleanerUser.email,
        bookingId: booking._id,
        serviceType: serviceType,
        date: schedule.date,
        startTime: schedule.startTime
      });

      // Log to database
      logEvent('info', 'New booking notification sent', {
        cleanerId: cleanerUser._id,
        bookingId: booking._id,
        serviceType: serviceType
      });
      
      // TODO: Implement actual notification system (SMS/Email/Push)
      // For now, we'll just log it. In production, you would:
      // - Send SMS via Twilio or similar
      // - Send Email via SendGrid or similar
      // - Create notification record in database
      // - Send push notification if cleaner has app
    }
  } catch (notificationError) {
    logError(notificationError, {
      bookingId: booking._id,
      context: 'cleaner_notification'
    });
    // Don't fail the booking creation if notification fails
  }

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
    .populate('cleaner', 'user')
    .populate({
      path: 'cleaner',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    })
    .sort({ createdAt: -1 });

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
  // Find cleaner profile for this user
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
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate({
      path: 'cleaner',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    });

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user has access to this booking
  const isUser = req.user.role === 'user' && booking.user._id.toString() === req.user.id;
  const isCleaner = req.user.role === 'cleaner' && booking.cleaner.user._id.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

  if (!isUser && !isCleaner && !isAdmin) {
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
  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'payment_pending'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid status'
    });
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check authorization
  const isUser = req.user.role === 'user' && booking.user.toString() === req.user.id;
  const isCleaner = req.user.role === 'cleaner';
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

  if (req.user.role === 'cleaner') {
    const cleaner = await Cleaner.findOne({ user: req.user.id });
    if (!cleaner || booking.cleaner.toString() !== cleaner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
  } else if (!isUser && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this booking'
    });
  }

  // Update status
  booking.status = status;
  await booking.save();

  await booking.populate('user', 'name email phone');
  await booking.populate({
    path: 'cleaner',
    populate: {
      path: 'user',
      select: 'name email phone'
    }
  });

  res.status(200).json({
    success: true,
    message: 'Booking status updated',
    data: booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const { cancellationReason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check authorization
  const isUser = req.user.role === 'user' && booking.user.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

  if (!isUser && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking'
    });
  }

  // Check if booking can be cancelled
  if (booking.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel a completed booking'
    });
  }

  // Cancel booking
  booking.status = 'cancelled';
  if (cancellationReason) {
    booking.cancellationReason = cancellationReason;
  }
  await booking.save();

  await booking.populate('user', 'name email phone');
  await booking.populate({
    path: 'cleaner',
    populate: {
      path: 'user',
      select: 'name email phone'
    }
  });

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  });
});


