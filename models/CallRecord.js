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

// Update company's total calls and user stats when a call is saved
callRecordSchema.post('save', async function() {
  try {
    console.log('📞 CallRecord post-save hook triggered for call:', {
      id: this._id,
      user: this.user,
      company: this.company,
      callResult: this.callResult,
      callDate: this.callDate
    });
    
    const Company = mongoose.model('Company');
    const User = mongoose.model('User');
    const DailyCallHistory = mongoose.model('DailyCallHistory');
    const { getTurkeyNow, getTurkeyDateOnly, isSameTurkeyDay } = require('../utils/timezone');
    
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
    console.log('✅ Company updated successfully');
    
    // Update user points and today's calls if call result is set
    if (this.callResult) {
      console.log('📊 Updating user stats and daily history...');
      const user = await User.findById(this.user);
      if (user) {
        const turkeyNow = getTurkeyNow();
        const lastCallDate = user.lastCallDate || new Date(0);
        
        // Check if it's a new day using Turkey timezone comparison
        const isNewDay = !isSameTurkeyDay(turkeyNow, lastCallDate);
        
        // If it's a new day, reset todaysCalls to 1, otherwise increment
        const todaysCallsUpdate = isNewDay ? 1 : user.todaysCalls + 1;
        
        await User.findByIdAndUpdate(this.user, {
          $inc: { points: 1 },
          $set: { 
            todaysCalls: todaysCallsUpdate,
            lastCallDate: turkeyNow
          }
        });
        console.log('✅ User stats updated, todaysCalls:', todaysCallsUpdate);
        
        // Update daily call history for calendar tracking
        console.log('📅 Updating daily call history...');
        
        // Use proper Turkey date for daily record
        const turkeyDateOnly = getTurkeyDateOnly(turkeyNow);
        
        const dailyRecord = await DailyCallHistory.updateDailyRecord(this.user, turkeyDateOnly, user.targetCallNumber);
        console.log('✅ Daily call history updated:', {
          date: dailyRecord.date,
          callsMade: dailyRecord.callsMade,
          targetReached: dailyRecord.targetReached
        });
      }
    } else {
      console.log('⚠️ No callResult set, skipping user stats and daily history update');
    }
  } catch (error) {
    console.error('❌ Error updating company and user stats:', error);
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