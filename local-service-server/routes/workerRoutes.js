const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");
const { adminAuth } = require("../middleware/authMiddleware");

// Public routes
router.get("/", workerController.getAllWorkers);
router.get("/services", workerController.getServicesForDropdown); // New endpoint for services dropdown
router.get("/:id", workerController.getWorkerById);

// Admin protected routes
router.post("/", adminAuth, workerController.createWorker);
router.put("/:id", adminAuth, workerController.updateWorker);
router.delete("/:id", adminAuth, workerController.deleteWorker);

module.exports = router;