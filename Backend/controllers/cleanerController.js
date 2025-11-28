const Cleaner = require('../models/Cleaner');
const User = require('../models/User');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');

// @desc    Get all cleaners (search/list)
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
    limit = 10
  } = req.query;

  // Build query
  const query = { isVerified: true };

  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === 'true';
  }

  if (minRating) {
    query['rating.average'] = { $gte: parseFloat(minRating) };
  }

  if (maxPrice) {
    query.hourlyRate = { $lte: parseFloat(maxPrice) };
  }

  if (serviceType) {
    query.specialties = { $in: [serviceType] };
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get cleaners
  let cleaners = await Cleaner.find(query)
    .populate('user', 'name email phone profilePhoto')
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Filter by location if provided (simple city/state match)
  if (city || state) {
    cleaners = cleaners.filter(cleaner => {
      const user = cleaner.user;
      if (!user || !user.address) return false;
      if (city && user.address.city && user.address.city.toLowerCase() !== city.toLowerCase()) {
        return false;
      }
      if (state && user.address.state && user.address.state.toLowerCase() !== state.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  // Get total count
  const total = await Cleaner.countDocuments(query);

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
    .populate('user', 'name email phone profilePhoto address');

  if (!cleaner) {
    return res.status(404).json({
      success: false,
      message: 'Cleaner not found'
    });
  }

  if (!cleaner.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Cleaner profile is not verified'
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

// @desc    Apply to become cleaner
// @route   POST /api/cleaners/apply
// @access  Private/User
exports.applyAsCleaner = asyncHandler(async (req, res, next) => {
  const {
    bio,
    experience,
    specialties,
    hourlyRate,
    availability,
    workingHours,
    documents
  } = req.body;

  // Check if user can apply
  const user = await User.findById(req.user.id);
  
  if (!user.canApplyAsCleaner()) {
    return res.status(400).json({
      success: false,
      message: `Cannot apply. Current application status: ${user.cleanerApplication.status}`
    });
  }

  // Validate required fields
  if (!bio || !hourlyRate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide bio and hourlyRate'
    });
  }

  // Update user's cleaner application
  user.cleanerApplication = {
    ...user.cleanerApplication,
    bio,
    experience: experience || 0,
    specialties: specialties || [],
    hourlyRate,
    availability: availability || user.cleanerApplication.availability,
    workingHours: workingHours || user.cleanerApplication.workingHours,
    documents: documents || {},
    status: 'pending',
    appliedAt: new Date()
  };

  // Try to use transaction for atomicity (requires replica set)
  // Fall back to individual operations if transactions aren't supported
  let cleaner;
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Save user document within transaction
      await user.save({ session });
      console.log(`✅ User document saved successfully for user: ${user._id} (transaction)`);

      // Create or update cleaner profile within transaction
      cleaner = await Cleaner.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          bio,
          experience: experience || 0,
          specialties: specialties || [],
          hourlyRate,
          availability: availability || {},
          workingHours: workingHours || {},
          documents: documents || {},
          isVerified: false
        },
        { upsert: true, new: true, session }
      );
      console.log(`✅ Cleaner document saved successfully for user: ${user._id}, cleaner ID: ${cleaner._id} (transaction)`);
    });
    
    console.log('✅ Transaction completed successfully');
  } catch (transactionError) {
    // If transaction fails (e.g., no replica set), fall back to individual operations
    if (transactionError.message && transactionError.message.includes('replica set')) {
      console.warn('⚠️  Transactions not supported (no replica set), falling back to individual operations');
      
      // Save user document with detailed error logging
      try {
        await user.save();
        console.log(`✅ User document saved successfully for user: ${user._id}`);
      } catch (error) {
        console.error('❌ Error saving user document:', {
          userId: user._id,
          error: error.message,
          stack: error.stack
        });
        throw error;
      }

      // Create or update cleaner profile (will be verified when admin approves)
      try {
        cleaner = await Cleaner.findOneAndUpdate(
          { user: user._id },
          {
            user: user._id,
            bio,
            experience: experience || 0,
            specialties: specialties || [],
            hourlyRate,
            availability: availability || {},
            workingHours: workingHours || {},
            documents: documents || {},
            isVerified: false
          },
          { upsert: true, new: true }
        );
        console.log(`✅ Cleaner document saved successfully for user: ${user._id}, cleaner ID: ${cleaner._id}`);
      } catch (error) {
        console.error('❌ Error saving cleaner document:', {
          userId: user._id,
          error: error.message,
          stack: error.stack
        });
        // If cleaner save fails, we should ideally rollback user changes
        // For now, we'll throw the error to prevent inconsistent state
        throw new Error(`Failed to create cleaner profile: ${error.message}`);
      }
    } else {
      // Transaction error that's not about replica set
      console.error('❌ Transaction error:', {
        userId: user._id,
        error: transactionError.message,
        stack: transactionError.stack
      });
      throw transactionError;
    }
  } finally {
    await session.endSession();
  }

  // Verification step: Confirm Cleaner document was created
  const verificationCleaner = await Cleaner.findById(cleaner._id);
  if (!verificationCleaner) {
    console.error('❌ Verification failed: Cleaner document not found after creation', {
      cleanerId: cleaner._id,
      userId: user._id
    });
    return res.status(500).json({
      success: false,
      message: 'Cleaner application submitted but verification failed. Please contact support.'
    });
  }

  console.log(`✅ Verification passed: Cleaner document confirmed in database for user: ${user._id}`);

  res.status(201).json({
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
  // Find cleaner profile for this user
  const cleaner = await Cleaner.findOne({ user: req.user.id });
  
  if (!cleaner) {
    return res.status(404).json({
      success: false,
      message: 'Cleaner profile not found'
    });
  }

  const {
    bio,
    experience,
    specialties,
    hourlyRate,
    availability,
    workingHours,
    photos,
    isAvailable
  } = req.body;

  // Update fields
  if (bio !== undefined) cleaner.bio = bio;
  if (experience !== undefined) cleaner.experience = experience;
  if (specialties !== undefined) cleaner.specialties = specialties;
  if (hourlyRate !== undefined) cleaner.hourlyRate = hourlyRate;
  if (availability !== undefined) cleaner.availability = availability;
  if (workingHours !== undefined) cleaner.workingHours = workingHours;
  if (photos !== undefined) cleaner.photos = photos;
  if (isAvailable !== undefined) cleaner.isAvailable = isAvailable;

  await cleaner.save();

  await cleaner.populate('user', 'name email phone profilePhoto');

  res.status(200).json({
    success: true,
    message: 'Cleaner profile updated successfully',
    data: cleaner
  });
});


