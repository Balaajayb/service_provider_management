const Admin = require("../models/Admin");
const User = require("../models/user");
const fs = require('fs');
const path = require('path');
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

const loginAdmin = async (req, res) => {
  try {
    const { admin_email, admin_pass } = req.body;

    if (!admin_email || !admin_pass) {
      return res.status(400).json({
        success: false,
        code: "MISSING_CREDENTIALS",
        message: "Email and password required"
      });
    }

    const admin = await Admin.findOne({ admin_email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        code: "ADMIN_NOT_FOUND",
        message: "email not found"
      });
    }

    const isMatch = await bcrypt.compare(admin_pass, admin.admin_pass);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Incorrect Password"
      });
    }

    const token = generateToken(admin._id, 'admin');

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.admin_email
      },
      expiresIn: process.env.ADMIN_TOKEN_EXPIRES_IN || '8h'
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Login failed"
    });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id)
      .select("-admin_pass -__v");

    res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Failed to get profile"
    });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        code: "ADMIN_NOT_FOUND",
        message: "Admin not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.admin_pass);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: "INVALID_PASSWORD",
        message: "Current password is incorrect"
      });
    }

    if (newEmail) admin.admin_email = newEmail;
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      admin.admin_pass = await bcrypt.hash(newPassword, salt);
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated"
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Update failed"
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-__v")
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Failed to get users"
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Failed to get user"
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Find user without password first
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found"
      });
    }

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    // Handle password update - let pre-save hook handle hashing
    if (password && password.trim() !== '') {
      user.password = password; // Store plaintext - pre-save will hash it
      user.markModified('password'); // Force Mongoose to recognize change
    }

    // This will trigger the pre-save hook to hash the password
    await user.save();

    // Verify the update by fetching fresh data
    const updatedUser = await User.findById(req.params.id).select('+password');
    console.log('Verification - Stored hash:', updatedUser.password);

    // Return response without sensitive data
    const userData = updatedUser.toObject();
    delete userData.password;
    delete userData.__v;

    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Failed to update user"
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found"
      });
    }

    // Delete profile picture if exists
    if (user.profilePicture) {
      const filePath = path.join(__dirname, '../uploads', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User and associated files deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Delete failed"
    });
  }
};
// Add this to your existing adminController.js
const getDashboardStats = async (req, res) => {
  try {
    // Import models at the top of your controller
    const User = require('../models/User');
    const Service = require('../models/Service');
    const Worker = require('../models/Worker');
    const Booking = require('../models/Booking');

    // Use Promise.all for parallel queries
    const [users, services, workers, bookings] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments(),
      Worker.countDocuments(),
      Booking.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users,
        services,
        workers,
        bookings
      }
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  updateAdmin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats
};