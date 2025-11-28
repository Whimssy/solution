const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    match: [/^\+?[\d\s-()]+$/, 'Please add a valid phone number'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'cleaner', 'admin'],
    default: 'user'
  },
  profilePhoto: {
    type: String,
    default: 'default-avatar.png'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
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
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Cleaner Application System
  cleanerApplication: {
    status: {
      type: String,
      enum: ['not_applied', 'pending', 'approved', 'rejected'],
      default: 'not_applied'
    },
    appliedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Admin'
    },
    rejectionReason: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    experience: {
      type: Number,
      min: 0,
      default: 0
    },
    specialties: [{
      type: String,
      enum: ['residential', 'commercial', 'deep_cleaning', 'move_in_out', 'office', 'post_construction']
    }],
    hourlyRate: {
      type: Number,
      min: [100, 'Hourly rate must be at least KSh 100']
    },
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false }
    },
    workingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' }
    },
    documents: {
      idPhoto: String,
      certificate: String,
      policeClearance: String
    }
  },

  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Convert lat/lng coordinates to GeoJSON format for geospatial queries
userSchema.pre('save', function(next) {
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
userSchema.pre('validate', async function(next) {
  // Validate cleanerApplication.hourlyRate only exists when status is not 'not_applied'
  if (this.cleanerApplication && this.cleanerApplication.status === 'not_applied') {
    if (this.cleanerApplication.hourlyRate !== undefined && this.cleanerApplication.hourlyRate !== null) {
      return next(new Error('Hourly rate should not be set when application status is "not_applied"'));
    }
  }

  // Validate reviewedBy references valid Admin if provided
  if (this.cleanerApplication && this.cleanerApplication.reviewedBy) {
    const Admin = mongoose.model('Admin');
    const adminExists = await Admin.findById(this.cleanerApplication.reviewedBy);
    if (!adminExists) {
      return next(new Error('reviewedBy must reference a valid Admin'));
    }
  }

  next();
});

// Post-save hook to update cleanerApplication reviewedBy reference
userSchema.post('save', async function(doc) {
  // Ensure cleanerApplication.reviewedBy is valid if set
  if (doc.cleanerApplication && doc.cleanerApplication.reviewedBy) {
    const Admin = mongoose.model('Admin');
    const adminExists = await Admin.findById(doc.cleanerApplication.reviewedBy);
    if (!adminExists && doc.isNew === false) {
      // Only log warning on updates, not on new documents
      console.warn(`Warning: User ${doc._id} has invalid reviewedBy reference: ${doc.cleanerApplication.reviewedBy}`);
    }
  }
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id,
      role: this.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to apply as cleaner
userSchema.methods.applyAsCleaner = function(applicationData) {
  this.cleanerApplication = {
    ...this.cleanerApplication,
    ...applicationData,
    status: 'pending',
    appliedAt: new Date()
  };
  return this.save();
};

// Method to check if user can apply as cleaner
userSchema.methods.canApplyAsCleaner = function() {
  return this.cleanerApplication.status === 'not_applied' || 
         this.cleanerApplication.status === 'rejected';
};

// Method to get application status
userSchema.methods.getApplicationStatus = function() {
  return this.cleanerApplication.status;
};

// Method to check if user is approved cleaner
userSchema.methods.isApprovedCleaner = function() {
  return this.role === 'cleaner' && this.cleanerApplication.status === 'approved';
};

// Virtual for application status
userSchema.virtual('applicationStatus').get(function() {
  return this.cleanerApplication.status;
});

// Virtual for isCleaner
userSchema.virtual('isCleaner').get(function() {
  return this.role === 'cleaner' && this.cleanerApplication.status === 'approved';
});

// Virtual for hasPendingApplication
userSchema.virtual('hasPendingApplication').get(function() {
  return this.cleanerApplication.status === 'pending';
});

// Indexes for faster queries
userSchema.index({ email: 1 }); // Already unique, but ensure index exists
// Note: phone field already has unique: true in schema definition (line 31), which automatically creates unique index
userSchema.index({ role: 1, 'cleanerApplication.status': 1 }); // Compound index for role and application status
userSchema.index({ 'cleanerApplication.status': 1 }); // Single field index for application status queries

// Geospatial index for location-based queries (using GeoJSON format)
userSchema.index({ 'address.location': '2dsphere' }, { 
  sparse: true // Only index documents that have location coordinates
});

// Static method to get pending applications
userSchema.statics.getPendingApplications = function() {
  return this.find({ 'cleanerApplication.status': 'pending' })
    .select('name email phone cleanerApplication');
};

// Static method to get approved cleaners
userSchema.statics.getApprovedCleaners = function() {
  return this.find({ 
    role: 'cleaner', 
    'cleanerApplication.status': 'approved' 
  });
};

// Static method to count pending applications
userSchema.statics.countPendingApplications = function() {
  return this.countDocuments({ 'cleanerApplication.status': 'pending' });
};

// Static method to count approved cleaners
userSchema.statics.countApprovedCleaners = function() {
  return this.countDocuments({ 
    role: 'cleaner', 
    'cleanerApplication.status': 'approved' 
  });
};

// Transform output to include virtuals
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);