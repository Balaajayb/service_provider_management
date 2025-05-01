const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        code: "MISSING_FIELDS",
        message: "Please provide all required fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: "USER_EXISTS",
        message: "User already exists with this email",
      });
    }

    let profilePicPath = null;
    if (req.file) {
      profilePicPath = `uploads/${req.file.filename}`.replace(/\\/g, "/");
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      profilePicture: profilePicPath,
    });

    await user.save();
    const token = generateToken(user._id, "user");

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: profilePicPath
          ? `${process.env.BASE_URL}/${profilePicPath}`
          : null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Registration failed",
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: "MISSING_CREDENTIALS",
        message: "Email and password are required",
      });
    }

    // Find user with password field explicitly selected
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "Invalid email address",
      });
    }

    // Use the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Incorrect Password",
      });
    }

    // Generate token
    const token = generateToken(user._id, "user");

    // Return user data without sensitive fields
    const userData = user.toObject();
    delete userData.password;
    delete userData.__v;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        ...userData,
        profilePicture: user.profilePicture
          ? `${process.env.BASE_URL}/${user.profilePicture.replace(/\\/g, "/")}`
          : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Login failed",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found",           
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture
          ? `${process.env.BASE_URL || "http://localhost:5000"}/${user.profilePicture.replace(
              /\\/g,
              "/"
            )}`
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error.message);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Failed to fetch user details",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found"
      });
    }

    // Check if email is being changed to one that already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          code: "EMAIL_EXISTS",
          message: "Email already in use by another account"
        });
      }
    }

    // Handle profile picture update
    let profilePicPath = user.profilePicture;
    if (req.file) {
      // Delete old profile picture if it exists
      if (profilePicPath) {
        const oldImagePath = path.join(__dirname, '../', profilePicPath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      profilePicPath = `uploads/${req.file.filename}`.replace(/\\/g, '/');
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }
    
    if (profilePicPath) {
      user.profilePicture = profilePicPath;
    }

    await user.save();

    // Prepare response
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const updatedUser = await User.findById(user._id).select('-password');

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profilePicture: updatedUser.profilePicture 
          ? `${baseUrl}/${updatedUser.profilePicture.replace(/\\/g, '/')}`
          : null
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Validation error: " + error.message
      });
    }

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Failed to update profile"
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile
};