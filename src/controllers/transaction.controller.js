const e = require('express');
const transactionRepository = require('../repositories/transaction.repository');
const itemRepository = require('../repositories/item.repository');
const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.createTransaction = async (req, res) => {
    const { item_id, quantity, user_id } = req.body;

    if (!item_id || !quantity || !user_id) {
        return baseResponse(res, false, 400, 'Item ID, quantity, and user ID are required', null);
    }

    try {
        if (quantity <= 0) {
            return baseResponse(res, false, 400, 'Quantity must be greater than 0', null);
        }

        const item = await itemRepository.getItemById(item_id);
        if (!item) {
            return baseResponse(res, false, 404, 'Item not found', null);
        }

        const user = await userRepository.getUserById(user_id);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }

        const total = item.price * quantity;

        const transaction = await transactionRepository.createTransaction({ 
            item_id, 
            quantity, 
            user_id, 
            total
        });

        return baseResponse(res, true, 201, 'Transaction created successfully', transaction);
        
    } catch (error) {
        return baseResponse(res, false, 500, error.message || "Server error", error);
    }
};

exports.payTransaction = async (req, res) => {
    const { transaction_id } = req.params;

    if (!transaction_id) {
        return baseResponse(res, false, 400, 'Transaction ID is required', null);
    }

    try {
        const result = await transactionRepository.payTransaction(transaction_id);
        baseResponse(res, true, 200, "Payment Successful", result);
    } catch (error) {
        baseResponse(res, false, 400, error.message, null);
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await transactionRepository.getAllTransactions();
        return baseResponse(res, true, 200, 'Transactions retrieved successfully', transactions);
    } catch (error) {
        return baseResponse(res, false, 400, error.message || "Server error", null);
    }
};

exports.deleteTransaction = async (req, res) => {
    const { transaction_id } = req.params;

    if (!transaction_id) {
        return baseResponse(res, false, 400, 'Transaction ID is required', null);
    }

    try {
        const result = await transactionRepository.deleteTransaction(transaction_id);
        if (!result) {
            return baseResponse(res, false, 404, 'Transaction not found', null);
        }
        return baseResponse(res, true, 200, 'Transaction deleted successfully', result);
    } catch (error) {
        return baseResponse(res, false, 400, error.message || "Server error", null);
    }
};
