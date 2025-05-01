const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/authMiddleware');
const ratingController = require('../controllers/ratingController');

router.get('/', adminAuth, ratingController.getRatings);
router.get('/:id', adminAuth, ratingController.getRatingById);

module.exports = router;