const mongoose = require('mongoose');

const cleanerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
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
    required: [true, 'Please add an hourly rate'],
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
  photos: [String],
  documents: {
    idPhoto: String,
    certificate: String,
    policeClearance: String
  },
  rating: {
    average: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    count: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  servicesCompleted: {
    type: Number,
    default: 0
  },
  earnings: {
    total: { 
      type: Number, 
      default: 0,
      min: 0
    },
    pending: { 
      type: Number, 
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Data integrity validations
cleanerSchema.pre('validate', async function(next) {
  // Validate user reference exists
  if (this.user) {
    const User = mongoose.model('User');
    const userExists = await User.findById(this.user);
    if (!userExists) {
      return next(new Error('User reference must be valid'));
    }
  }

  // Validate rating average is within bounds
  if (this.rating && this.rating.average !== undefined) {
    if (this.rating.average < 0 || this.rating.average > 5) {
      return next(new Error('Rating average must be between 0 and 5'));
    }
    if (this.rating.count < 0) {
      return next(new Error('Rating count cannot be negative'));
    }
  }

  // Validate hourlyRate matches User's cleanerApplication when verified
  if (this.isVerified && this.user) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    if (user && user.cleanerApplication && user.cleanerApplication.hourlyRate) {
      if (user.cleanerApplication.hourlyRate !== this.hourlyRate) {
        // Allow slight differences due to updates, but log a warning
        console.warn(`Warning: Cleaner hourlyRate (${this.hourlyRate}) differs from User application hourlyRate (${user.cleanerApplication.hourlyRate})`);
      }
    }
  }

  next();
});

// Post-save hook to ensure user exists and is valid
cleanerSchema.post('save', async function(doc) {
  const User = mongoose.model('User');
  const userExists = await User.findById(doc.user);
  if (!userExists) {
    console.error(`Error: Cleaner ${doc._id} references non-existent user ${doc.user}`);
  }
});

// Indexes for optimized queries
// Unique index: one user = one cleaner profile
cleanerSchema.index({ user: 1 }, { unique: true });

// Compound index for search/filtering verified and available cleaners by rating
cleanerSchema.index({ isVerified: 1, isAvailable: 1, 'rating.average': -1 });

// Index for filtering by specialties (multikey index for array field)
cleanerSchema.index({ specialties: 1 });

// Index for price range queries
cleanerSchema.index({ hourlyRate: 1 });

// Compound index for common search pattern: verified cleaners with rating and availability
cleanerSchema.index({ isVerified: 1, isAvailable: 1, hourlyRate: 1, 'rating.average': -1 });

// Index for services completed count (for sorting by experience)
cleanerSchema.index({ servicesCompleted: -1 });

module.exports = mongoose.model('Cleaner', cleanerSchema);