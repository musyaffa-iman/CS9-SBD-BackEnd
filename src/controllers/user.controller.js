const e = require('express');
const userRepository = require('../repositories/user.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.register = async (req, res) => {
    const { name, email, password } = req.query;
    if (!name || !email || !password) {
        return baseResponse(res, false, 400, 'Name, email and password are required', null);
    }
    try {
        const emailExist = await userRepository.getUserByEmail(email);
        if (emailExist) {
            return baseResponse(res, false, 400, 'Email already exists', null);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return baseResponse(res, false, 400, 'Invalid email', null);
        }

        const passwordRegex = /^(?=.*[0-9])(?=.*\W).{8,}$/;
        if (!passwordRegex.test(password)) {
            return baseResponse(res, false, 400, 'Password must have at least 8 characters, one number and one special character', null);
        }

        const user = await userRepository.register({ name, email, password });
        baseResponse(res, true, 201, 'User created successfully', user);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.query;
    if (!email || !password) {
        return baseResponse(res, false, 400, 'Email and password are required');
    }
    try {
        const user = await userRepository.login(email, password);
        if (!user) {
            return baseResponse(res, false, 404, 'Invalid email or password', null);
        }
        baseResponse(res, true, 200, 'User logged in successfully', user);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.getUserByEmail = async (req, res) => {
    try {
        const user = await userRepository.getUserByEmail(req.params.email);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        baseResponse(res, true, 200, 'User found', user);
    } catch (error) {
        return baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.updateUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userRepository.updateUser(req.body);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return baseResponse(res, false, 400, 'Invalid email', null);
        }

        const passwordRegex = /^(?=.*[0-9])(?=.*\W).{8,}$/;
        if (!passwordRegex.test(password)) {
            return baseResponse(res, false, 400, 'New password must have at least 8 characters, one number and one special character', null);
        }
        return baseResponse(res, true, 200, 'User updated successfully', user);
    } catch (error) {
        return baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await userRepository.deleteUser(req.params.id);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        return baseResponse(res, true, 200, 'User deleted successfully', user);
    } catch (error) {
        return baseResponse(res, false, 500, error.message || "Server error", error);
    }
}

exports.topUp = async (req, res) => {
    const { id, amount } = req.query;
    console.log(id, amount);
    if (!id || !amount) {
        return baseResponse(res, false, 400, 'User ID and balance are required', null);
    }
    if (amount <= 0) {
        return baseResponse(res, false, 400, 'Balance must be larger than 0', null);
    }
    try {
        const user = await userRepository.topUp(id, amount);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        return baseResponse(res, true, 200, 'Balance topped up successfully', user);
    } catch (error) {
        return baseResponse(res, false, 500, error.message || "Server error", error);
    }
}