const Rating = require('../models/Ratings');
const Booking = require('../models/Bookings');
const asyncHandler = require('express-async-handler');

const getRatings = asyncHandler(async (req, res) => {
  const { service, worker, user } = req.query;
  const query = {};
  
  if (service) query.service = service;
  if (worker) query.worker = worker;
  if (user) query.user = user;

  const ratings = await Rating.find(query)
    .populate('user', 'name email')
    .populate('worker', 'name phone')
    .populate('service', 'name')
    .populate('booking')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: ratings.length,
    data: ratings
  });
});

const getRatingById = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id)
    .populate('user', 'name email')
    .populate('worker', 'name phone')
    .populate('service', 'name')
    .populate('booking');

  if (!rating) {
    return res.status(404).json({
      success: false,
      code: "RATING_NOT_FOUND",
      message: "Rating not found"
    });
  }

  res.status(200).json({
    success: true,
    data: rating
  });
});

module.exports = {
  getRatings,
  getRatingById
};