const mongoose = require('mongoose');

const dailyUserRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  dailyTarget: {
    type: Number,
    required: [true, 'Daily target is required'],
    min: [0, 'Daily target cannot be negative'],
    default: 0
  },
  callCount: {
    type: Number,
    default: 0,
    min: [0, 'Call count cannot be negative']
  },
  calls: [{
    callRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CallRecord',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    callResult: {
      type: String,
      enum: ['Sekreter', 'Satınalma', 'Lab Şefi', 'İhtiyaç Yok', 'Potansiyel']
    },
    callTime: {
      type: Date,
      required: true
    }
  }],
  targetReached: {
    type: Boolean,
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

// Create compound index for unique daily records per user
dailyUserRecordSchema.index({ date: 1, user: 1 }, { unique: true });

// Update the updatedAt field before saving
dailyUserRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Check if target is reached
  this.targetReached = this.callCount >= this.dailyTarget;
  
  next();
});

// Instance method to add a call
dailyUserRecordSchema.methods.addCall = function(callRecord, company, callResult, callTime) {
  this.calls.push({
    callRecord,
    company,
    callResult,
    callTime
  });
  
  this.callCount = this.calls.length;
  this.targetReached = this.callCount >= this.dailyTarget;
  
  return this.save();
};

// Static method to check if a date is a workday (Monday-Friday)
dailyUserRecordSchema.statics.isWorkDay = function(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
};

// Static method to get today's date string (YYYY-MM-DD)
dailyUserRecordSchema.statics.getTodayDateString = function() {
  // Server is already in Turkey timezone (Europe/Istanbul)
  // Just use current date without any timezone conversion
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const DailyUserRecord = mongoose.model('DailyUserRecord', dailyUserRecordSchema);

module.exports = DailyUserRecord; 