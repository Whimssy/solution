const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  cleaner: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cleaner',
    required: true
  },
  serviceType: {
    type: String,
    required: [true, 'Please specify service type'],
    enum: ['regular_cleaning', 'deep_cleaning', 'move_in_out', 'office_cleaning', 'post_construction']
  },
  schedule: {
    date: {
      type: Date,
      required: [true, 'Please add a booking date']
    },
    startTime: {
      type: String,
      required: [true, 'Please add start time']
    },
    duration: {
      type: Number,
      required: [true, 'Please add duration in hours'],
      min: [1, 'Duration must be at least 1 hour']
    },
    endTime: String
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: String,
    instructions: String,
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 }
    },
    // GeoJSON format for 2dsphere index (computed from coordinates)
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude] - populated from lat/lng
    }
  },
  details: {
    bedrooms: { 
      type: Number, 
      default: 0,
      min: [0, 'Bedrooms cannot be negative']
    },
    bathrooms: { 
      type: Number, 
      default: 0,
      min: [0, 'Bathrooms cannot be negative']
    },
    livingRooms: { 
      type: Number, 
      default: 0,
      min: [0, 'Living rooms cannot be negative']
    },
    kitchens: { 
      type: Number, 
      default: 0,
      min: [0, 'Kitchens cannot be negative']
    },
    extraTasks: [String],
    specialInstructions: String
  },
  pricing: {
    baseAmount: { 
      type: Number, 
      required: true,
      min: [0, 'Base amount cannot be negative']
    },
    extraCharges: { 
      type: Number, 
      default: 0,
      min: [0, 'Extra charges cannot be negative']
    },
    discount: { 
      type: Number, 
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    totalAmount: { 
      type: Number, 
      required: true,
      min: [0, 'Total amount cannot be negative']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'payment_pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Payment',
    required: false // Optional until Payment model is implemented
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: Date
  },
  cancellationReason: String,
  rescheduledFrom: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true
});

// Calculate end time before saving
bookingSchema.pre('save', function(next) {
  if (this.schedule.startTime && this.schedule.duration) {
    const [hours, minutes] = this.schedule.startTime.split(':').map(Number);
    const endHours = hours + this.schedule.duration;
    this.schedule.endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Convert lat/lng coordinates to GeoJSON format for geospatial queries
  if (this.address && this.address.coordinates) {
    const lat = this.address.coordinates.lat;
    const lng = this.address.coordinates.lng;
    
    if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
      // Populate location field for 2dsphere index (GeoJSON format: [lng, lat])
      if (!this.address.location) {
        this.address.location = {};
      }
      this.address.location.type = 'Point';
      this.address.location.coordinates = [lng, lat];
    } else {
      // Clear location if coordinates are incomplete
      this.address.location = undefined;
    }
  }

  next();
});

// Data integrity validations
bookingSchema.pre('validate', async function(next) {
  // Validate schedule.date must be in the future (unless it's a completed/cancelled booking)
  if (this.schedule && this.schedule.date) {
    const bookingDate = new Date(this.schedule.date);
    const now = new Date();
    
    // Allow past dates only for completed or cancelled bookings
    if (bookingDate < now && !['completed', 'cancelled'].includes(this.status)) {
      return next(new Error('Booking date must be in the future for new bookings'));
    }
  }

  // Validate pricing.totalAmount = baseAmount + extraCharges - discount
  if (this.pricing) {
    const calculatedTotal = this.pricing.baseAmount + 
                           (this.pricing.extraCharges || 0) - 
                           (this.pricing.discount || 0);
    
    // Allow small rounding differences (0.01)
    if (Math.abs(calculatedTotal - this.pricing.totalAmount) > 0.01) {
      return next(new Error(`Total amount (${this.pricing.totalAmount}) must equal baseAmount + extraCharges - discount (${calculatedTotal})`));
    }
  }

  // Validate rating.score only allowed when status is 'completed'
  if (this.rating && this.rating.score !== undefined && this.rating.score !== null) {
    if (this.status !== 'completed') {
      return next(new Error('Rating can only be added to completed bookings'));
    }
  }

  // Validate paymentStatus consistency
  if (this.status === 'payment_pending' && this.paymentStatus !== 'pending') {
    return next(new Error('Booking status "payment_pending" requires paymentStatus to be "pending"'));
  }

  if (this.status === 'completed' && this.paymentStatus === 'pending') {
    // Allow completed bookings with pending payment (for manual payment processing)
    console.warn(`Warning: Booking ${this._id} is completed but payment is still pending`);
  }

  // Validate user and cleaner references exist
  if (this.user) {
    const User = mongoose.model('User');
    const userExists = await User.findById(this.user);
    if (!userExists) {
      return next(new Error('User reference must be valid'));
    }
  }

  if (this.cleaner) {
    const Cleaner = mongoose.model('Cleaner');
    const cleanerExists = await Cleaner.findById(this.cleaner);
    if (!cleanerExists) {
      return next(new Error('Cleaner reference must be valid'));
    }

    // Validate cleaner is verified and available
    if (!cleanerExists.isVerified) {
      return next(new Error('Cannot book with an unverified cleaner'));
    }

    if (!cleanerExists.isAvailable) {
      return next(new Error('Cannot book with an unavailable cleaner'));
    }
  }

  // Validate rescheduledFrom reference if provided
  if (this.rescheduledFrom) {
    const Booking = mongoose.model('Booking');
    const originalBooking = await Booking.findById(this.rescheduledFrom);
    if (!originalBooking) {
      return next(new Error('rescheduledFrom must reference a valid booking'));
    }
  }

  next();
});

// Pre-save hook to check for scheduling conflicts
bookingSchema.pre('save', async function(next) {
  // Only check conflicts for new bookings or when schedule is modified
  if (this.isNew || this.isModified('schedule') || this.isModified('cleaner')) {
    if (this.status === 'cancelled') {
      return next(); // Skip conflict check for cancelled bookings
    }

    // Check for overlapping bookings with the same cleaner
    const Booking = mongoose.model('Booking');
    const bookingDate = new Date(this.schedule.date);
    const startTime = this.schedule.startTime;
    const duration = this.schedule.duration || 1;
    
    // Parse start time
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + duration);

    // Find conflicting bookings on the same day (using date range to match entire day)
    // Create date range for the entire day to catch all bookings regardless of time
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setDate(startOfNextDay.getDate() + 1); // Start of next day

    const conflictingBookings = await Booking.find({
      _id: { $ne: this._id }, // Exclude current booking
      cleaner: this.cleaner,
      status: { $nin: ['cancelled', 'completed'] }, // Exclude cancelled/completed
      'schedule.date': {
        $gte: startOfDay,
        $lt: startOfNextDay // All bookings on the same day (00:00:00 to 23:59:59.999)
      }
    });

    // Check for time overlap
    for (const booking of conflictingBookings) {
      if (booking.schedule.startTime && booking.schedule.duration) {
        const [otherStartHours, otherStartMinutes] = booking.schedule.startTime.split(':').map(Number);
        const otherStartDateTime = new Date(bookingDate);
        otherStartDateTime.setHours(otherStartHours, otherStartMinutes, 0, 0);
        
        const otherEndDateTime = new Date(otherStartDateTime);
        otherEndDateTime.setHours(otherEndDateTime.getHours() + booking.schedule.duration);

        // Check if time ranges overlap
        if ((startDateTime < otherEndDateTime && endDateTime > otherStartDateTime)) {
          return next(new Error(`Booking conflicts with existing booking. Cleaner is already booked from ${booking.schedule.startTime} for ${booking.schedule.duration} hours`));
        }
      }
    }
  }

  next();
});

// Comprehensive indexes for optimized queries

// Compound index for user's bookings (most common query pattern)
bookingSchema.index({ user: 1, status: 1, 'schedule.date': -1 });

// Compound index for cleaner's bookings
bookingSchema.index({ cleaner: 1, status: 1, 'schedule.date': -1 });

// Compound index for conflict detection (cleaner + date + time)
bookingSchema.index({ cleaner: 1, 'schedule.date': 1, 'schedule.startTime': 1 });

// Compound index for admin queries (status + date)
bookingSchema.index({ status: 1, 'schedule.date': 1 });

// Index for service type filtering
bookingSchema.index({ serviceType: 1 });

// Index for payment status queries
bookingSchema.index({ paymentStatus: 1, status: 1 });

// Geospatial index for location-based queries
bookingSchema.index({ 'address.location': '2dsphere' }, { 
  sparse: true // Only index documents that have location coordinates
});

// Compound index for date range queries
bookingSchema.index({ 'schedule.date': 1, status: 1 });

// Index for rating queries
bookingSchema.index({ 'rating.score': -1 });

module.exports = mongoose.model('Booking', bookingSchema);