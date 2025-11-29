const Cleaner = require('../models/Cleaner');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    List/search cleaners
// @route   GET /api/cleaners
// @access  Public
exports.getCleaners = asyncHandler(async (req, res, next) => {
  const {
    city,
    state,
    serviceType,
    minRating,
    maxPrice,
    isAvailable,
    page = 1,
    limit = 100
  } = req.query;

  // Build base query - show verified cleaners (or all for development)
  // In production, you might want to only show verified cleaners
  const query = {};
  
  // Uncomment to only show verified cleaners:
  // query.isVerified = true;

  // Filter by availability
  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === 'true';
  }

  // Filter by service type (specialties)
  if (serviceType) {
    query.specialties = { $in: [serviceType] };
  }

  // Filter by minimum rating
  if (minRating) {
    query['rating.average'] = { $gte: parseFloat(minRating) };
  }

  // Filter by maximum price
  if (maxPrice) {
    query.hourlyRate = { $lte: parseFloat(maxPrice) };
  }

  // Filter by city/state using aggregation or find users first
  let userFilter = {};
  if (city || state) {
    const User = require('../models/User');
    const addressQuery = {};
    if (city) addressQuery['address.city'] = new RegExp(city, 'i');
    if (state) addressQuery['address.state'] = new RegExp(state, 'i');
    
    const usersInLocation = await User.find(addressQuery).select('_id');
    const userIds = usersInLocation.map(u => u._id);
    
    if (userIds.length > 0) {
      query.user = { $in: userIds };
    } else {
      // No users found in that location, return empty result
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        page: parseInt(page),
        pages: 0,
        data: []
      });
    }
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with population
  const cleaners = await Cleaner.find(query)
    .populate({
      path: 'user',
      select: 'name email phone profilePhoto address',
      options: { strictPopulate: false } // Don't fail if user doesn't exist
    })
    .select('-documents') // Exclude sensitive documents
    .sort({ 'rating.average': -1, 'servicesCompleted': -1 }) // Sort by rating and experience
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Cleaner.countDocuments(query);
  
  // Log for debugging
  console.log(`[getCleaners] Found ${cleaners.length} cleaners (total: ${total}), query:`, JSON.stringify(query));

  res.status(200).json({
    success: true,
    count: cleaners.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: cleaners
  });
});

// @desc    Get cleaner by ID
// @route   GET /api/cleaners/:id
// @access  Public
exports.getCleanerById = asyncHandler(async (req, res, next) => {
  const cleaner = await Cleaner.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name email phone profilePhoto address'
    })
    .select('-documents'); // Exclude sensitive documents

  if (!cleaner) {
    return res.status(404).json({
      success: false,
      message: 'Cleaner not found'
    });
  }

  res.status(200).json({
    success: true,
    data: cleaner
  });
});

// @desc    Get cleaner's bookings
// @route   GET /api/cleaners/me/bookings
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

  const Booking = require('../models/Booking');
  const bookings = await Booking.find(query)
    .populate({
      path: 'user',
      select: 'name email phone'
    })
    .sort({ 'schedule.date': 1, 'schedule.startTime': 1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Apply to become cleaner
// @route   POST /api/cleaners/apply
// @access  Private/User
exports.applyAsCleaner = asyncHandler(async (req, res, next) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user can apply
  if (!user.canApplyAsCleaner()) {
    return res.status(400).json({
      success: false,
      message: `Cannot apply. Current application status: ${user.cleanerApplication.status}`
    });
  }

  const {
    bio,
    experience,
    specialties,
    hourlyRate,
    availability,
    workingHours,
    documents
  } = req.body;

  // Submit application using user method
  await user.applyAsCleaner({
    bio,
    experience,
    specialties,
    hourlyRate,
    availability,
    workingHours,
    documents
  });

  res.status(200).json({
    success: true,
    message: 'Cleaner application submitted successfully',
    data: {
      applicationStatus: user.cleanerApplication.status,
      appliedAt: user.cleanerApplication.appliedAt
    }
  });
});

// @desc    Update cleaner profile
// @route   PUT /api/cleaners/me
// @access  Private/Cleaner
exports.updateCleanerProfile = asyncHandler(async (req, res, next) => {
  const cleaner = await Cleaner.findOne({ user: req.user.id });

  if (!cleaner) {
    return res.status(404).json({
      success: false,
      message: 'Cleaner profile not found'
    });
  }

  const fieldsToUpdate = {
    bio: req.body.bio,
    experience: req.body.experience,
    specialties: req.body.specialties,
    hourlyRate: req.body.hourlyRate,
    availability: req.body.availability,
    workingHours: req.body.workingHours,
    photos: req.body.photos,
    isAvailable: req.body.isAvailable
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const updatedCleaner = await Cleaner.findByIdAndUpdate(
    cleaner._id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).populate({
    path: 'user',
    select: 'name email phone profilePhoto address'
  });

  res.status(200).json({
    success: true,
    message: 'Cleaner profile updated successfully',
    data: updatedCleaner
  });
});

