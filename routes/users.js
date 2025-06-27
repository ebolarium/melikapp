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

// Get user's daily records for calendar (new endpoint)
router.get('/daily-records', async (req, res) => {
  try {
    const { year, month, userId } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ 
        success: false, 
        message: 'Year and month are required' 
      });
    }

    const targetUserId = userId || req.user?.id;
    if (!targetUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const DailyUserRecord = require('../models/DailyUserRecord');
    
    // Create date range for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    endDate.setHours(23, 59, 59, 999);

    // Fetch daily records for the month
    const dailyRecords = await DailyUserRecord.find({
      user: targetUserId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).select('date dailyTarget callCount targetReached');

    // Convert to a map for easy lookup
    const recordsMap = {};
    dailyRecords.forEach(record => {
      // Format date using Turkish timezone to avoid UTC conversion issues
      const year = record.date.getFullYear();
      const month = String(record.date.getMonth() + 1).padStart(2, '0');
      const day = String(record.date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      recordsMap[dateKey] = {
        dailyTarget: record.dailyTarget,
        callCount: record.callCount,
        targetReached: record.targetReached
      };
    });

    res.json({
      success: true,
      data: recordsMap
    });

  } catch (error) {
    console.error('Error fetching daily records for calendar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch daily records' 
    });
  }
});

module.exports = router; 