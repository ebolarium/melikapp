const mongoose = require('mongoose');

const callRecordSchema = new mongoose.Schema({
  callDate: {
    type: Date,
    required: [true, 'Call date is required'],
    default: Date.now
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  // Call outcome - single selection field
  callResult: {
    type: String,
    enum: {
      values: ['Sekreter', 'Satınalma', 'Lab Şefi', 'İhtiyaç Yok', 'Potansiyel'],
      message: 'Call result must be Sekreter, Satınalma, Lab Şefi, İhtiyaç Yok, or Potansiyel'
    }
  },
  // Additional call details
  callDuration: {
    type: Number, // Duration in minutes
    min: [0, 'Call duration cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Call notes cannot exceed 500 characters']
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  callType: {
    type: String,
    enum: {
      values: ['Cold Call', 'Follow Up', 'Scheduled', 'Return Call'],
      message: 'Call type must be Cold Call, Follow Up, Scheduled, or Return Call'
    },
    default: 'Cold Call'
  },
  callStatus: {
    type: String,
    enum: {
      values: ['Completed', 'No Answer', 'Busy', 'Voicemail', 'Declined'],
      message: 'Call status must be Completed, No Answer, Busy, Voicemail, or Declined'
    },
    default: 'Completed'
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
callRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update company's total calls when a call is saved
callRecordSchema.post('save', async function() {
  try {
    const Company = mongoose.model('Company');
    
    // Prepare company update object
    const companyUpdate = {
      $inc: { totalCalls: 1 },
      lastContactDate: this.callDate
    };
    
    // If call result is "İhtiyaç Yok", update company's spectro field
    if (this.callResult === 'İhtiyaç Yok') {
      companyUpdate.$set = { spectro: 'İhtiyaç Yok' };
    }
    
    // Update company call count, last contact date, and potentially spectro field
    await Company.findByIdAndUpdate(this.company, companyUpdate);
    
    // Award points to user if call has result
    if (this.callResult) {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(this.user, {
        $inc: { points: 1 }
      });
    }
    
    // Add call to daily record (separate system)
    try {
      const DailyRecordService = require('../services/dailyRecordService');
      await DailyRecordService.addCallToTodaysRecord(
        this.user,
        this._id,
        this.company,
        this.callResult,
        this.callDate
      );
    } catch (dailyRecordError) {
      console.error('❌ Error adding call to daily record:', dailyRecordError.message);
      // Don't throw error to prevent main call creation from failing
    }
    
    // Note: Daily call history is now updated by the call sync service
    
  } catch (error) {
    console.error('❌ Error updating company stats:', error);
  }
});

// Indexes for faster queries
callRecordSchema.index({ callDate: -1 });
callRecordSchema.index({ company: 1 });
callRecordSchema.index({ user: 1 });
callRecordSchema.index({ callResult: 1 });
callRecordSchema.index({ followUpRequired: 1, followUpDate: 1 });

const CallRecord = mongoose.model('CallRecord', callRecordSchema);

module.exports = CallRecord; 