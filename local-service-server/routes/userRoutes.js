const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const userController = require("../controllers/userController");
const { userAuth } = require("../middleware/authMiddleware");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

// Error handler for file uploads
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      code: "FILE_UPLOAD_ERROR",
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      code: "FILE_VALIDATION_ERROR",
      message: err.message
    });
  }
  next();
};

// Public routes
router.post("/register", upload.single('profilePicture'), handleUploadErrors, userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes
router.get("/me", userAuth, userController.getCurrentUser);
router.put("/me", userAuth, upload.single('profilePicture'), handleUploadErrors, userController.updateUserProfile);

module.exports = router;