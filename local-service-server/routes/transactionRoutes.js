const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.get('/', adminAuth, transactionController.getTransactions);
router.get('/:id', adminAuth, transactionController.getTransactionById);

module.exports = router;