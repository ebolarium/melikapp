const express = require('express');
const router = express.Router();
const simpleAuth = require('../middleware/simpleAuth');
const { getDailyHistory, getCallStats, createTodayRecord, getTodaysCalls, getTodaysCallCount, getAllUsersOverview } = require('../controllers/userController');
const callSyncService = require('../services/callSyncService');

// Get daily call history for calendar view
// GET /api/users/daily-history?year=2025&month=6
router.get('/daily-history', simpleAuth, getDailyHistory);

// Get user call statistics summary
// GET /api/users/call-stats
router.get('/call-stats', simpleAuth, getCallStats);

// Get today's call records for current user
// GET /api/users/todays-calls
router.get('/todays-calls', simpleAuth, getTodaysCalls);

// GET /api/users/todays-call-count - Get today's call count from DailyCallHistory
router.get('/todays-call-count', simpleAuth, getTodaysCallCount);

// Create or get today's daily record (for testing/admin purposes)
// POST /api/users/today-record
router.post('/today-record', simpleAuth, createTodayRecord);

// Get all users overview (admin only)
// GET /api/users/all-overview
router.get('/all-overview', simpleAuth, getAllUsersOverview);

// Manual sync trigger (for testing)
router.post('/sync-calls', simpleAuth, async (req, res) => {
  try {
    await callSyncService.manualSync();
    res.json({
      success: true,
      message: 'Call sync triggered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error triggering call sync',
      error: error.message
    });
  }
});

module.exports = router; 