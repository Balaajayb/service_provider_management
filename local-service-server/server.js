const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const workerRoutes = require("./routes/workerRoutes");
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require("./routes/dashboardRoutes");
const ratingRoutes = require('./routes/ratingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const path = require("path");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes - now properly organized
app.use("/api/users", userRoutes); // All user routes including admin user management
app.use("/api/admin", adminRoutes); // Other admin-specific routes
app.use("/api/services", serviceRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
