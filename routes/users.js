const express = require('express');
const router = express.Router();
const simpleAuth = require('../middleware/simpleAuth');
const { getDailyHistory, getCallStats, createTodayRecord, getTodaysCalls } = require('../controllers/userController');

// Get daily call history for calendar view
// GET /api/users/daily-history?year=2025&month=6
router.get('/daily-history', simpleAuth, getDailyHistory);

// Get user call statistics summary
// GET /api/users/call-stats
router.get('/call-stats', simpleAuth, getCallStats);

// Get today's call records for current user
// GET /api/users/todays-calls
router.get('/todays-calls', simpleAuth, getTodaysCalls);

// Create or get today's daily record (for testing/admin purposes)
// POST /api/users/today-record
router.post('/today-record', simpleAuth, createTodayRecord);

module.exports = router; 