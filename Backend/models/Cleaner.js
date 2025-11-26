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
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
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
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cleaner', cleanerSchema);