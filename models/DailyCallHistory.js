const mongoose = require('mongoose');

const dailyCallHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  callsMade: {
    type: Number,
    required: [true, 'Calls made is required'],
    min: [0, 'Calls made cannot be negative'],
    default: 0
  },
  targetForDay: {
    type: Number,
    required: [true, 'Target for day is required'],
    min: [0, 'Target cannot be negative']
  },
  targetReached: {
    type: Boolean,
    required: [true, 'Target reached status is required'],
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
dailyCallHistorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to ensure one record per user per day
dailyCallHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

// Index for faster queries by date range
dailyCallHistorySchema.index({ date: 1 });
dailyCallHistorySchema.index({ userId: 1, date: -1 });

// Static method to get or create daily history record
dailyCallHistorySchema.statics.getOrCreateDailyRecord = async function(userId, date, targetCallNumber) {
  try {
    // Create date object with only date part (no time)
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    // Try to find existing record
    let dailyRecord = await this.findOne({
      userId: userId,
      date: dateOnly
    });
    
    if (!dailyRecord) {
      // Create new record if doesn't exist
      dailyRecord = await this.create({
        userId: userId,
        date: dateOnly,
        callsMade: 0,
        targetForDay: targetCallNumber,
        targetReached: false
      });
    }
    
    return dailyRecord;
  } catch (error) {
    console.error('Error getting or creating daily record:', error);
    throw error;
  }
};

// Static method to update daily record when call is made
dailyCallHistorySchema.statics.updateDailyRecord = async function(userId, date, targetCallNumber) {
  try {
    // Create date object with only date part (no time)
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    // Get or create the daily record
    const dailyRecord = await this.getOrCreateDailyRecord(userId, dateOnly, targetCallNumber);
    
    // Increment calls made
    dailyRecord.callsMade += 1;
    
    // Update target reached status
    dailyRecord.targetReached = dailyRecord.callsMade >= dailyRecord.targetForDay;
    
    // Save the updated record
    await dailyRecord.save();
    
    return dailyRecord;
  } catch (error) {
    console.error('Error updating daily record:', error);
    throw error;
  }
};

// Static method to get calendar data for a specific month
dailyCallHistorySchema.statics.getCalendarData = async function(userId, year, month) {
  try {
    // Create start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
    
    // Get all records for the month
    const records = await this.find({
      userId: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
    
    return records;
  } catch (error) {
    console.error('Error getting calendar data:', error);
    throw error;
  }
};

const DailyCallHistory = mongoose.model('DailyCallHistory', dailyCallHistorySchema);

module.exports = DailyCallHistory; 