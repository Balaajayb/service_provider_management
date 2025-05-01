const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { adminAuth } = require("../middleware/authMiddleware");

// Admin authentication routes
router.post("/login", adminController.loginAdmin);
router.get("/profile", adminAuth, adminController.getAdminProfile);
router.put("/update", adminAuth, adminController.updateAdmin);

// Admin user management routes (protected by adminAuth)
router.get("/stats", adminAuth, adminController.getDashboardStats);
router.get("/users", adminAuth, adminController.getAllUsers);
router.get("/users/:id", adminAuth, adminController.getUserById);
router.put("/users/:id", adminAuth, adminController.updateUser);
router.delete("/users/:id", adminAuth, adminController.deleteUser);

module.exports = router;