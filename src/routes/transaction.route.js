const transactionController = require('../controllers/transaction.controller');
const express = require('express');
const router = express.Router();

router.post('/create', transactionController.createTransaction);
router.post('/pay/:transaction_id', transactionController.payTransaction);
router.get('/', transactionController.getAllTransactions);
router.delete('/:transaction_id', transactionController.deleteTransaction);

module.exports = router;