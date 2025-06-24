const { User, DailyCallHistory } = require('../models');
const CallRecord = require('../models/CallRecord');

// Get daily call history for calendar view
const getDailyHistory = async (req, res) => {
  try {
    const { userId, year, month } = req.query;
    
    // Validate userId parameter
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Validate year and month parameters
    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = parseInt(month) || new Date().getMonth() + 1;
    
    if (currentMonth < 1 || currentMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }
    
    // Get calendar data for the specified month
    const dailyRecords = await DailyCallHistory.getCalendarData(userId, currentYear, currentMonth);
    
    // Get user info for statistics calculation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate total days since user started
    const userStartDate = new Date(user.createdAt);
    const today = new Date();
    const totalDaysSinceStart = Math.floor((today - userStartDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate statistics
    const totalTargetReachedDays = await DailyCallHistory.countDocuments({
      userId: userId,
      targetReached: true
    });
    
    // Calculate current streak (consecutive days with target reached)
    const recentRecords = await DailyCallHistory.find({
      userId: userId,
      date: { $lte: today }
    }).sort({ date: -1 }).limit(30); // Get last 30 days to calculate streak
    
    let currentStreak = 0;
    for (const record of recentRecords) {
      if (record.targetReached) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Format response data
    const formattedDays = dailyRecords.map(record => ({
      date: record.date.toISOString().split('T')[0], // YYYY-MM-DD format
      callsMade: record.callsMade,
      target: record.targetForDay,
      targetReached: record.targetReached,
      isToday: record.date.toDateString() === today.toDateString()
    }));
    
    res.json({
      success: true,
      data: {
        month: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
        stats: {
          totalDaysSinceStart,
          targetReachedDays: totalTargetReachedDays,
          currentStreak
        },
        days: formattedDays
      }
    });
    
  } catch (error) {
    console.error('Error getting daily history:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving daily history',
      error: error.message
    });
  }
};

// Get user call statistics summary
const getCallStats = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Validate userId parameter
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate total days since user started
    const userStartDate = new Date(user.createdAt);
    const today = new Date();
    const totalDaysSinceStart = Math.floor((today - userStartDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get total target reached days
    const totalTargetReachedDays = await DailyCallHistory.countDocuments({
      userId: userId,
      targetReached: true
    });
    
    // Get current month statistics
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const monthlyRecords = await DailyCallHistory.getCalendarData(userId, currentYear, currentMonth);
    
    const monthlyStats = {
      totalDays: monthlyRecords.length,
      targetReachedDays: monthlyRecords.filter(record => record.targetReached).length,
      totalCalls: monthlyRecords.reduce((sum, record) => sum + record.callsMade, 0)
    };
    
    // Calculate success rate
    const successRate = totalDaysSinceStart > 0 ? 
      Math.round((totalTargetReachedDays / totalDaysSinceStart) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        user: {
          name: user.userName,
          level: user.level,
          currentTarget: user.targetCallNumber,
          totalPoints: user.points,
          todaysCalls: user.todaysCalls
        },
        overall: {
          totalDaysSinceStart,
          targetReachedDays: totalTargetReachedDays,
          successRate
        },
        currentMonth: monthlyStats
      }
    });
    
  } catch (error) {
    console.error('Error getting call stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving call statistics',
      error: error.message
    });
  }
};

// Create or update today's daily record manually (for testing/admin purposes)
const createTodayRecord = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date();
    
    // Validate userId parameter
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create or get today's record
    const dailyRecord = await DailyCallHistory.getOrCreateDailyRecord(
      userId, 
      today, 
      user.targetCallNumber
    );
    
    res.json({
      success: true,
      data: {
        date: dailyRecord.date.toISOString().split('T')[0],
        callsMade: dailyRecord.callsMade,
        target: dailyRecord.targetForDay,
        targetReached: dailyRecord.targetReached
      }
    });
    
  } catch (error) {
    console.error('Error creating today record:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating today record',
      error: error.message
    });
  }
};

// Get today's call records for the current user
const getTodaysCalls = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get today's start and end
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's call records for this user
    const callRecords = await CallRecord.find({
      user: userId,
      callDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .populate('company', 'companyName person phone city')
    .sort({ callDate: -1 });

    res.json({
      success: true,
      data: callRecords,
      count: callRecords.length
    });

  } catch (error) {
    console.error('Error getting today\'s calls:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving today\'s calls',
      error: error.message
    });
  }
};

module.exports = {
  getDailyHistory,
  getCallStats,
  createTodayRecord,
  getTodaysCalls
}; 