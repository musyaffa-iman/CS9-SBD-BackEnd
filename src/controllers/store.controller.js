const e = require('express');
const storeRepository = require('../repositories/store.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.getAllStores = async (req, res) => {
    try {
        const stores = await storeRepository.getAllStores();
        res.json({ 
            success: true,
            payload: stores
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

exports.createStore = async (req, res) => {
    if (!req.body.name || !req.body.address) {
        baseResponse(res, false, 400, 'Name and address are required');
    }
    try {
        const store = await storeRepository.createStore(req.body);
        baseResponse(res, true, 201, 'Store created successfully', store);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.getStoreById = async (req, res) => {
    try {
        const store = await storeRepository.getStoreById(req.params.id);
        if (!store) {
            baseResponse(res, false, 404, 'Store not found', null);
        }
        baseResponse(res, true, 200, 'Store retrieved successfully', store);
    } catch (error) {
        baseResponse(res, false, 500, 'An error occurred', error);
    }
}

exports.updateStore = async (req, res) => {
    if (!req.body.name || !req.body.address) {
        baseResponse(res, false, 400, 'Name and address are required');
    }
    try {
        const store = await storeRepository.updateStore(req.body);
        if (!store) {
            baseResponse(res, false, 404, 'Store not found', null);
        }
        baseResponse(res, true, 200, 'Store updated successfully', store);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.deleteStore = async (req, res) => {
    try {
        const store = await storeRepository.deleteStore(req.params.id);
        if (!store) {
            baseResponse(res, false, 404, 'Store not found', null);
        }
        baseResponse(res, true, 200, 'Store deleted successfully', store);
    } catch (error) {
        baseResponse(res, false, 500, 'An error occurred', error);
    }
}