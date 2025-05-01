const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { adminAuth } = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");

// Admin protected routes
router.post("/", adminAuth, upload.single('image'), serviceController.addService);
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);
router.put("/:id", adminAuth, upload.single('image'), serviceController.updateService);
router.delete("/:id", adminAuth, serviceController.deleteService);
router.get("/featured", serviceController.getFeaturedServices);

module.exports = router;