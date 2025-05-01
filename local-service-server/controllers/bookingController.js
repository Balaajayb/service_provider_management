const Booking = require("../models/Bookings");
const Worker = require("../models/Worker");
const Rating = require("../models/Ratings");
const Transaction = require("../models/Transaction");
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
// Location data with distances from Vadasery
const LOCATIONS = [
  { name: "Parvathipuram", distance: 6 },
  { name: "Muttom", distance: 16 },
  { name: "Pazhavilai", distance: 8 },
  { name: "Mangavilai", distance: 9 },
  { name: "Kanyakumari", distance: 18 },
  { name: "Karungal", distance: 23 },
  { name: "Nagercoil Junction", distance: 3 },
  { name: "Nagercoil Town", distance: 2 },
  { name: "Edaicode", distance: 25 },
  { name: "Arumanai", distance: 30 },
  { name: "Kulasekaram", distance: 35 },
  { name: "Thuckalay", distance: 15 },
  { name: "Marthandam", distance: 25 },
  { name: "Kuzhithurai", distance: 27 },
  { name: "Colachel", distance: 20 },
  { name: "Thiruvattaru", distance: 30 },
  { name: "Boothapandi", distance: 10 },
  { name: "Eraniel", distance: 15 },
  { name: "Suchindram", distance: 7 },
  { name: "Rajakkamangalam", distance: 12 },
  { name: "Manavalakurichi", distance: 18 },
  { name: "Thingalnagar", distance: 22 }
];

// @desc    Create a new booking with dynamic pricing
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    service,
    name,
    email,
    phone,
    address,
    location,
    date,
    time,
    specialInstructions,
    serviceName,
    serviceCharge,
    distance
  } = req.body;

  if (!service || !name || !email || !phone || !address || !date || !time || !location || !distance) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const booking = await Booking.create({
    user: req.user.id,
    service,
    serviceName,
    name,
    email,
    phone,
    address,
    location: {
      name: location,
      distance: distance
    },
    date,
    time,
    specialInstructions,
    serviceCharge,
    totalAmount: serviceCharge
  });

  res.status(201).json({
    success: true,
    data: booking
  });
});
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, from, to } = req.query;
  const query = {};

  if (status) query.status = status;
  if (from && to) {
    query.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to)
    };
  }

  const bookings = await Booking.find(query)
    .populate({
      path: 'user',
      select: 'name email phone'
    })
    .populate({
      path: 'service',
      select: 'name'
    })
    .populate({
      path: 'assignedWorker',
      select: 'name phone service',
      populate: {
        path: 'service',
        select: 'name'
      }
    })
    .populate('rating')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
const getUserBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate('service', 'name')
    .populate({
      path: 'assignedWorker',
      select: 'name phone service',
      populate: {
        path: 'service',
        select: 'name'
      }
    })
    .populate('rating')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('service', 'name description')
    .populate('assignedWorker', 'name phone');

  if (!booking) {
    return res.status(404).json({
      success: false,
      code: "BOOKING_NOT_FOUND",
      message: "Booking not found"
    });
  }

  // Check authorization - user can access their own bookings, admin can access all
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      code: "UNAUTHORIZED_ACCESS",
      message: "Not authorized to access this booking"
    });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking status (admin only)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'assigned', 'on_the_way', 'completed', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      code: "INVALID_STATUS",
      message: "Please provide a valid status"
    });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      code: "BOOKING_NOT_FOUND",
      message: "Booking not found"
    });
  }

  booking.status = status;
  await booking.save();

  res.status(200).json({
    success: true,
    code: "STATUS_UPDATED",
    message: "Booking status updated successfully",
    data: booking
  });
});

// @desc    Assign worker to booking (admin only)
// @route   PUT /api/bookings/:id/assign-worker
// @access  Private (Admin)
const assignWorkerToBooking = asyncHandler(async (req, res) => {
  const { workerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(workerId)) {
    return res.status(400).json({
      success: false,
      code: "INVALID_WORKER_ID",
      message: "Invalid worker ID format"
    });
  }

  try {
    const worker = await Worker.findById(workerId).populate('service', 'name');
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name')
      .populate('user', 'name email phone');

    if (!worker) {
      return res.status(404).json({
        success: false,
        code: "WORKER_NOT_FOUND",
        message: "Worker not found with the provided ID"
      });
    }
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        code: "BOOKING_NOT_FOUND",
        message: "Booking not found with the provided ID"
      });
    }

    // Update the booking
    booking.assignedWorker = worker._id;
    booking.status = 'assigned'; // Changed from 'confirmed' to 'assigned'
    
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'user',
        select: 'name email phone'
      })
      .populate({
        path: 'service',
        select: 'name'
      })
      .populate({
        path: 'assignedWorker',
        select: 'name phone service',
        populate: {
          path: 'service',
          select: 'name'
        }
      });

    res.status(200).json({
      success: true,
      code: "WORKER_ASSIGNED",
      message: "Worker assigned successfully",
      data: updatedBooking
    });
  } catch (error) {
    console.error("Error assigning worker:", error);
    res.status(500).json({
      success: false,
      code: "ASSIGNMENT_ERROR",
      message: error.message || "Failed to assign worker"
    });
  }
});

// @desc    Update booking charges (admin only)
// @route   PUT /api/bookings/:id/charges
// @access  Private (Admin)
const updateBookingCharges = asyncHandler(async (req, res) => {
  const { serviceCharge, materialDetails } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      code: "BOOKING_NOT_FOUND",
      message: "Booking not found"
    });
  }

  if (serviceCharge !== undefined) {
    booking.serviceCharge = serviceCharge;
  }

  if (materialDetails && Array.isArray(materialDetails)) {
    booking.materialDetails = materialDetails;
    booking.materialCharge = materialDetails.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  booking.totalAmount = booking.serviceCharge + booking.materialCharge;
  await booking.save();

  res.status(200).json({
    success: true,
    code: "CHARGES_UPDATED",
    message: "Booking charges updated successfully",
    data: booking
  });
});

const addRating = asyncHandler(async (req, res) => {
  const { stars, review } = req.body;
  const bookingId = req.params.id;

  if (!stars || stars < 1 || stars > 5) {
    return res.status(400).json({
      success: false,
      code: "INVALID_RATING",
      message: "Please provide a valid rating between 1 and 5 stars"
    });
  }

  try {
    const booking = await Booking.findById(bookingId)
      .populate('user')
      .populate('service')
      .populate('assignedWorker');

    if (!booking) {
      return res.status(404).json({
        success: false,
        code: "BOOKING_NOT_FOUND",
        message: "Booking not found"
      });
    }

    if (!booking.assignedWorker) {
      return res.status(400).json({
        success: false,
        code: "NO_WORKER_ASSIGNED",
        message: "Cannot rate a booking without an assigned worker"
      });
    }

    const rating = new Rating({
      booking: booking._id,
      user: booking.user._id,
      worker: booking.assignedWorker._id,
      service: booking.service._id,
      stars,
      review
    });

    await rating.save();

    // Update booking with rating reference
    booking.rating = rating._id;
    await booking.save();

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: rating
    });
  } catch (error) {
    console.error("Rating error:", error);
    res.status(500).json({
      success: false,
      code: "RATING_ERROR",
      message: "Failed to submit rating"
    });
  }
});

const processPayment = asyncHandler(async (req, res) => {
  const { paymentMethod, transactionId } = req.body;
  const bookingId = req.params.id;

  if (!paymentMethod || !['online', 'cash'].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      code: "INVALID_PAYMENT_METHOD",
      message: "Please provide a valid payment method"
    });
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        code: "BOOKING_NOT_FOUND",
        message: "Booking not found"
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      booking: booking._id,
      user: booking.user,
      amount: booking.totalAmount,
      paymentMethod,
      transactionId: paymentMethod === 'online' ? transactionId : null,
      status: paymentMethod === 'cash' ? 'pending' : 'completed'
    });

    await transaction.save();

    // Update booking payment status
    booking.payment = {
      status: paymentMethod === 'cash' ? 'pending' : 'paid',
      method: paymentMethod,
      transactionId: paymentMethod === 'online' ? transactionId : null,
      amount: booking.totalAmount,
      date: new Date()
    };

    if (paymentMethod === 'cash') {
      booking.status = 'on_the_way';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: {
        booking,
        transaction
      }
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      success: false,
      code: "PAYMENT_ERROR",
      message: "Failed to process payment"
    });
  }
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      code: "BOOKING_NOT_FOUND",
      message: "Booking not found"
    });
  }

  // Check if the booking belongs to the user
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Not authorized to cancel this booking"
    });
  }

  // Only allow cancellation if booking is pending or assigned
  if (!['pending', 'assigned'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      code: "CANCEL_NOT_ALLOWED",
      message: "You can only cancel bookings that are pending or assigned"
    });
  }

  booking.status = 'cancelled';
  await booking.save();

  res.status(200).json({
    success: true,
    message: "Booking cancelled successfully",
    data: booking
  });
});

// @desc    Update payment status (admin only)
// @route   PUT /api/bookings/:id/payment-status
// @access  Private (Admin)
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'completed', 'failed'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      code: "INVALID_STATUS",
      message: "Please provide a valid payment status (pending, completed, failed)"
    });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      code: "BOOKING_NOT_FOUND",
      message: "Booking not found"
    });
  }

  if (!booking.payment) {
    return res.status(400).json({
      success: false,
      code: "NO_PAYMENT",
      message: "This booking has no payment information"
    });
  }

  // Update the transaction status to 'completed'
  const transaction = await Transaction.findOneAndUpdate(
    { booking: booking._id },
    { 
      status: 'completed', // Always set transaction status to completed
      transactionId: booking.payment.transactionId || 
                   (booking.payment.method === 'cash' ? `CASH-${Date.now()}` : null)
    },
    { new: true }
  );

  if (!transaction) {
    return res.status(404).json({
      success: false,
      code: "TRANSACTION_NOT_FOUND",
      message: "Associated transaction not found"
    });
  }

  // Update booking payment status to 'paid' for cash payments
  booking.payment.status = booking.payment.method === 'cash' ? 'paid' : status;
  if (!booking.payment.transactionId && booking.payment.method === 'cash') {
    booking.payment.transactionId = transaction.transactionId;
  }
  await booking.save();

  res.status(200).json({
    success: true,
    code: "PAYMENT_STATUS_UPDATED",
    message: "Payment status updated successfully",
    data: {
      booking,
      transaction
    }
  });
});

module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  assignWorkerToBooking,
  updateBookingCharges,
  addRating,
  processPayment,
  cancelBooking,
  updatePaymentStatus
};