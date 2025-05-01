const express = require('express');
const router = express.Router();
const { userAuth, adminAuth } = require('../middleware/authMiddleware');
const bookingController = require("../controllers/bookingController");

// User-protected routes
router.post('/', userAuth, bookingController.createBooking);
router.get('/my-bookings', userAuth, bookingController.getUserBookings);
router.get('/:id', userAuth, bookingController.getBookingById);
router.post('/:id/rate', userAuth, bookingController.addRating);
router.post('/:id/pay', userAuth, bookingController.processPayment);
router.put('/:id/cancel', userAuth, bookingController.cancelBooking);

// Admin-protected routes
router.get('/', adminAuth, bookingController.getAllBookings);
router.put('/:id/status', adminAuth, bookingController.updateBookingStatus);
router.put('/:id/assign-worker', adminAuth, bookingController.assignWorkerToBooking);
router.put('/:id/charges', adminAuth, bookingController.updateBookingCharges);
router.put('/:id/payment-status', adminAuth, bookingController.updatePaymentStatus);

module.exports = router;