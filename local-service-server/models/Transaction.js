const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash'],
    required: true
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentDetails: Object,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

module.exports = mongoose.model('Transaction', transactionSchema);