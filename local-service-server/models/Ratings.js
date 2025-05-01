const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

module.exports = mongoose.model('Rating', ratingSchema);