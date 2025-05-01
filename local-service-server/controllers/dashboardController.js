const User = require("../models/User");
const Worker = require("../models/Worker");
const Service = require("../models/Service");
const Booking = require("../models/Bookings");

const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const workersCount = await Worker.countDocuments();
    const servicesCount = await Service.countDocuments();
    const bookingsCount = await Booking.countDocuments();

    res.json({
      users: usersCount,
      workers: workersCount,
      services: servicesCount,
      bookings: bookingsCount,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getDashboardStats };
