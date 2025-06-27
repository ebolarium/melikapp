const DailyUserRecord = require('../models/DailyUserRecord');
const User = require('../models/User');
const CallRecord = require('../models/CallRecord');

/**
 * Daily Record Service
 * Manages daily user records for tracking calls and targets
 */
class DailyRecordService {
  
  /**
   * Check if a date is a workday (Monday-Friday)
   * @param {Date} date - Date to check
   * @returns {boolean} - True if workday, false if weekend
   */
  static isWorkDay(date) {
    return DailyUserRecord.isWorkDay(date);
  }

  /**
   * Get today's date at midnight
   * @returns {Date} - Today's date at 00:00:00
   */
  static getTodayDate() {
    return DailyUserRecord.getTodayDateString();
  }

  /**
   * Create daily records for all active users for a specific date
   * @param {Date} date - Date to create records for
   * @returns {Promise<Array>} - Array of created records
   */
  static async createDailyRecordsForDate(date = null) {
    try {
      const targetDate = date || this.getTodayDate();
      
      // Only create records for workdays
      if (!this.isWorkDay(targetDate)) {
        console.log(`📅 Skipping record creation for ${targetDate.toDateString()} - Not a workday`);
        return [];
      }

      // Get all active users
      const activeUsers = await User.find({ isActive: true });
      
      if (activeUsers.length === 0) {
        console.log('📅 No active users found for daily record creation');
        return [];
      }

      const createdRecords = [];
      const creationPromises = activeUsers.map(async (user) => {
        try {
          // Check if record already exists for this user and date
          const existingRecord = await DailyUserRecord.findOne({
            date: targetDate,
            user: user._id
          });

          if (existingRecord) {
            console.log(`📅 Daily record already exists for user ${user.userName} on ${targetDate.toDateString()}`);
            return existingRecord;
          }

          // Create new daily record
          const dailyRecord = new DailyUserRecord({
            date: targetDate,
            user: user._id,
            dailyTarget: user.targetCallNumber !== undefined && user.targetCallNumber !== null ? user.targetCallNumber : 20, // Use user's target or default to 20
            callCount: 0,
            calls: [],
            targetReached: false
          });

          const savedRecord = await dailyRecord.save();
          console.log(`✅ Created daily record for user ${user.userName} on ${targetDate.toDateString()}`);
          createdRecords.push(savedRecord);
          return savedRecord;
          
        } catch (error) {
          if (error.code === 11000) {
            // Duplicate key error - record already exists
            console.log(`📅 Daily record already exists for user ${user.userName} on ${targetDate.toDateString()}`);
            return null;
          }
          console.error(`❌ Error creating daily record for user ${user.userName}:`, error.message);
          return null;
        }
      });

      await Promise.all(creationPromises);
      
      console.log(`📅 Daily record creation completed for ${targetDate.toDateString()}. Created ${createdRecords.length} new records.`);
      return createdRecords;
      
    } catch (error) {
      console.error('❌ Error in createDailyRecordsForDate:', error);
      throw error;
    }
  }

  /**
   * Add a call to today's daily record for a user
   * @param {string} userId - User ID
   * @param {string} callRecordId - Call Record ID
   * @param {string} companyId - Company ID
   * @param {string} callResult - Call result
   * @param {Date} callTime - Call time
   * @returns {Promise<Object>} - Updated daily record
   */
  static async addCallToTodaysRecord(userId, callRecordId, companyId, callResult, callTime = null) {
    try {
      const today = this.getTodayDate();
      const actualCallTime = callTime || new Date();

      // Only process if today is a workday
      if (!this.isWorkDay(today)) {
        console.log(`📅 Skipping call addition - ${today.toDateString()} is not a workday`);
        return null;
      }

      // Find or create today's record for the user
      let dailyRecord = await DailyUserRecord.findOne({
        date: today,
        user: userId
      });

      // If no record exists, create one
      if (!dailyRecord) {
        console.log(`📅 No daily record found for user ${userId}, creating one...`);
        const user = await User.findById(userId);
        
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }

                 dailyRecord = new DailyUserRecord({
           date: today,
           user: userId,
           dailyTarget: user.targetCallNumber !== undefined && user.targetCallNumber !== null ? user.targetCallNumber : 20,
           callCount: 0,
           calls: [],
           targetReached: false
         });
      }

      // Add the call to the record
      await dailyRecord.addCall(callRecordId, companyId, callResult, actualCallTime);
      
      console.log(`📞 Added call to daily record for user ${userId}. Total calls: ${dailyRecord.callCount}/${dailyRecord.dailyTarget}`);
      
      return dailyRecord;
      
    } catch (error) {
      console.error('❌ Error adding call to daily record:', error);
      throw error;
    }
  }

  /**
   * Get daily record for a user and date
   * @param {string} userId - User ID
   * @param {Date} date - Date to get record for
   * @returns {Promise<Object|null>} - Daily record or null if not found
   */
  static async getDailyRecord(userId, date = null) {
    try {
      const targetDate = date || this.getTodayDate();
      
      const dailyRecord = await DailyUserRecord.findOne({
        date: targetDate,
        user: userId
      }).populate('user', 'userName email targetCallNumber')
        .populate('calls.callRecord')
        .populate('calls.company', 'companyName city');

      return dailyRecord;
      
    } catch (error) {
      console.error('❌ Error getting daily record:', error);
      throw error;
    }
  }

  /**
   * Initialize daily records on server startup
   * Creates today's records if they don't exist
   */
  static async initializeDailyRecords() {
    try {
      console.log('🚀 Initializing daily records on server startup...');
      
      const today = this.getTodayDate();
      
      if (this.isWorkDay(today)) {
        await this.createDailyRecordsForDate(today);
        console.log('✅ Daily records initialization completed');
      } else {
        console.log('📅 Today is not a workday, skipping daily record initialization');
      }
      
    } catch (error) {
      console.error('❌ Error initializing daily records:', error);
    }
  }

  /**
   * Sync calls from CallRecord to DailyUserRecord
   * This can be used to backfill or sync existing calls
   * @param {Date} date - Date to sync calls for
   */
  static async syncCallsForDate(date = null) {
    try {
      const targetDate = date || this.getTodayDate();
      
      // Only sync for workdays
      if (!this.isWorkDay(targetDate)) {
        console.log(`📅 Skipping call sync for ${targetDate.toDateString()} - Not a workday`);
        return;
      }

      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all calls for the date
      const calls = await CallRecord.find({
        callDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).populate('user').populate('company');

      console.log(`📊 Found ${calls.length} calls to sync for ${targetDate.toDateString()}`);

      // Process each call
      for (const call of calls) {
        try {
          await this.addCallToTodaysRecord(
            call.user._id,
            call._id,
            call.company._id,
            call.callResult,
            call.callDate
          );
        } catch (error) {
          console.error(`❌ Error syncing call ${call._id}:`, error.message);
        }
      }

      console.log(`✅ Call sync completed for ${targetDate.toDateString()}`);
      
    } catch (error) {
      console.error('❌ Error syncing calls:', error);
      throw error;
    }
  }
}

module.exports = DailyRecordService; 