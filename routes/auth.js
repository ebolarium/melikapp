const express = require('express');
const router = express.Router();
const { signup, login, logout, getAllUsers, getProfile } = require('../controllers/authController');
const simpleAuth = require('../middleware/simpleAuth');

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', logout);

// @route   GET /api/auth/users
// @desc    Get all users (for testing)
// @access  Public
router.get('/users', getAllUsers);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', simpleAuth, getProfile);

module.exports = router; 