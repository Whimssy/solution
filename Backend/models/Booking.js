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
      lat: Number,
      lng: Number
    }
  },
  details: {
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    livingRooms: { type: Number, default: 0 },
    kitchens: { type: Number, default: 0 },
    extraTasks: [String],
    specialInstructions: String
  },
  pricing: {
    baseAmount: { type: Number, required: true },
    extraCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
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
    ref: 'Payment'
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
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);