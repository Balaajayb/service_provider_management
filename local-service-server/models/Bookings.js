const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    name: { type: String, required: true },
    distance: { type: Number, required: true }
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  specialInstructions: String,
  status: {
    type: String,
    enum: ['pending', 'assigned', 'on_the_way', 'completed', 'cancelled'],
    default: 'pending'
  },
  serviceCharge: {
    type: Number,
    default: 0
  },
  materialCharge: {
    type: Number,
    default: 0
  },
  materialDetails: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  payment: {
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    method: String,
    transactionId: String,
    amount: Number,
    date: Date
  },
  rating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;