const Transaction = require('../models/Transaction');
const asyncHandler = require('express-async-handler');

const getTransactions = asyncHandler(async (req, res) => {
  const { user, status, paymentMethod } = req.query;
  const query = {};
  
  if (user) query.user = user;
  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;

  const transactions = await Transaction.find(query)
    .populate({
      path: 'user',
      select: 'name email phone',
      model: 'User' // Explicitly specify the model
    })
    .populate({
      path: 'booking',
      select: 'serviceName date status user', // Include user in booking selection
      populate: [{
        path: 'user',
        select: 'name'
      }, {
        path: 'assignedWorker',
        select: 'name phone'
      }]
    })
    .sort({ createdAt: -1 });

  // Enhanced formatting with fallbacks
  const formattedTransactions = transactions.map(t => {
    // First try to get user from transaction, then from booking
    const userName = t.user?.name || t.booking?.user?.name || 'Unknown User';
    const userPhone = t.user?.phone || t.booking?.user?.phone || 'N/A';

    return {
      _id: t._id,
      bookingId: t.booking?._id || 'N/A',
      serviceName: t.booking?.serviceName || 'N/A',
      date: t.booking?.date || 'N/A',
      worker: t.booking?.assignedWorker?.name || 'Unassigned',
      user: userName, // This is the critical fix
      userPhone: userPhone,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      transactionId: t.transactionId || (t.paymentMethod === 'cash' ? 'Cash Payment' : 'N/A'),
      status: t.status,
      createdAt: t.createdAt
    };
  });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: formattedTransactions
  });
});


const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('user', 'name email')
    .populate('booking');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      code: "TRANSACTION_NOT_FOUND",
      message: "Transaction not found"
    });
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

module.exports = {
  getTransactions,
  getTransactionById
};