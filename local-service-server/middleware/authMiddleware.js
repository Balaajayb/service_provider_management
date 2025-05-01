const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/user");

const verifyToken = async (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token format - expected string");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured in environment");
  }

  try {
    return await jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      ignoreExpiration: false,
    });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    throw err;
  }
};

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "AUTH_REQUIRED",
        message: "Authorization token required"
      });
    }

    const token = authHeader.split(" ")[1].trim();
    const decoded = await verifyToken(token);

    // Specifically look for userId - user routes should only use user tokens
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        code: "INVALID_USER_TOKEN",
        message: "Token is not a valid user token"
      });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User account not found"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("User auth error:", error.message);
    const status = error.name === "TokenExpiredError" ? 401 : 500;
    res.status(status).json({
      success: false,
      code: "AUTH_FAILED",
      message: error.name === "TokenExpiredError" 
        ? "Session expired. Please login again." 
        : "Authentication failed"
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "AUTH_REQUIRED",
        message: "Authorization token required"
      });
    }

    const token = authHeader.split(" ")[1].trim();
    const decoded = await verifyToken(token);

    // Specifically look for adminId - admin routes should only use admin tokens
    if (!decoded.adminId) {
      return res.status(401).json({
        success: false,
        code: "INVALID_ADMIN_TOKEN",
        message: "Token is not a valid admin token"
      });
    }

    const admin = await Admin.findById(decoded.adminId).select("-admin_pass");
    if (!admin) {
      return res.status(404).json({
        success: false,
        code: "ADMIN_NOT_FOUND",
        message: "Admin account not found"
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error.message);
    const status = error.name === "TokenExpiredError" ? 401 : 500;
    res.status(status).json({
      success: false,
      code: "AUTH_FAILED",
      message: error.name === "TokenExpiredError" 
        ? "Session expired. Please login again." 
        : "Authentication failed"
    });
  }
};

// General protection middleware that auto-detects route type
const protect = (req, res, next) => {
  return req.path.startsWith("/admin") 
    ? adminAuth(req, res, next)
    : userAuth(req, res, next);
};

module.exports = {
  protect,
  userAuth,
  adminAuth,
  verifyToken,
  getCurrentUser: async (req, res) => {
    try {
      const user = req.user || req.admin;
      if (!user) {
        return res.status(404).json({
          success: false,
          code: "USER_NOT_FOUND",
          message: "User not authenticated"
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: req.admin ? "admin" : "user"
        }
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      return res.status(500).json({
        success: false,
        code: "SERVER_ERROR",
        message: "Failed to fetch user details"
      });
    }
  }
};