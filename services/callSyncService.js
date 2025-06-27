const { CallRecord, DailyCallHistory, User } = require('../models');
const { getTurkeyDateOnly } = require('../utils/timezone');
const cron = require('node-cron');

class CallSyncService {
  constructor() {
    this.isRunning = false;
    this.lastSyncTime = new Date();
  }

  /**
   * Sync call records to daily call history
   * This runs every minute to ensure data consistency
   */
  async syncCallsToDaily() {
    if (this.isRunning) {
      console.log('🔄 Call sync already running, skipping...');
      return;
    }

    try {
      this.isRunning = true;
      console.log('🔄 Starting call sync to daily history...');

      // Get the last sync time (with 2 minute buffer to be safe)
      const syncFromTime = new Date(this.lastSyncTime.getTime() - 2 * 60 * 1000);
      
      // Find all call records since last sync that have a callResult
      const recentCalls = await CallRecord.find({
        createdAt: { $gte: syncFromTime },
        callResult: { $exists: true, $ne: null }
      }).populate('user', 'targetCallNumber');

      if (recentCalls.length === 0) {
        console.log('✅ No new calls to sync');
        this.lastSyncTime = new Date();
        return;
      }

      console.log(`📞 Found ${recentCalls.length} calls to sync`);

      // Group calls by user and date
      const callsByUserAndDate = {};
      
      for (const call of recentCalls) {
        if (!call.user) continue;
        
        const turkeyDate = getTurkeyDateOnly(call.callDate);
        const dateKey = turkeyDate.toISOString().split('T')[0];
        const userKey = call.user._id.toString();
        const key = `${userKey}_${dateKey}`;
        
        if (!callsByUserAndDate[key]) {
          callsByUserAndDate[key] = {
            userId: call.user._id,
            date: turkeyDate,
            callCount: 0,
            targetCallNumber: call.user.targetCallNumber
          };
        }
        callsByUserAndDate[key].callCount++;
      }

      // Update daily call history records
      for (const [key, data] of Object.entries(callsByUserAndDate)) {
        await this.updateDailyRecord(
          data.userId,
          data.date,
          data.callCount,
          data.targetCallNumber
        );
      }

      this.lastSyncTime = new Date();
      console.log('✅ Call sync completed successfully');

    } catch (error) {
      console.error('❌ Error in call sync service:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Update or create daily call history record
   */
  async updateDailyRecord(userId, date, newCallsCount, targetCallNumber) {
    try {
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      // Find existing record
      let dailyRecord = await DailyCallHistory.findOne({
        userId: userId,
        date: dateOnly
      });

      if (!dailyRecord) {
        // Create new record
        dailyRecord = new DailyCallHistory({
          userId: userId,
          date: dateOnly,
          callsMade: newCallsCount,
          targetForDay: targetCallNumber,
          targetReached: newCallsCount >= targetCallNumber
        });
      } else {
        // Update existing record - add new calls to existing count
        dailyRecord.callsMade += newCallsCount;
        dailyRecord.targetReached = dailyRecord.callsMade >= dailyRecord.targetForDay;
        
        // Update target if user's target changed (but keep historical targets)
        // Only update target for today's record
        const today = getTurkeyDateOnly(new Date());
        const isToday = dateOnly.getTime() === today.getTime();
        if (isToday) {
          dailyRecord.targetForDay = targetCallNumber;
          dailyRecord.targetReached = dailyRecord.callsMade >= targetCallNumber;
        }
      }

      await dailyRecord.save();
      console.log(`📅 Updated daily record: ${userId} ${dateOnly.toISOString().split('T')[0]} - ${dailyRecord.callsMade} calls`);

    } catch (error) {
      console.error('❌ Error updating daily record:', error);
      throw error;
    }
  }

  /**
   * Start the cron job
   */
  start() {
    console.log('🚀 Starting call sync service (every minute)...');
    
    // Run immediately on start
    this.syncCallsToDaily();
    
    // Schedule to run every minute
    cron.schedule('* * * * *', () => {
      this.syncCallsToDaily();
    });
    
    console.log('✅ Call sync service started');
  }

  /**
   * Manual sync trigger (for testing/admin purposes)
   */
  async manualSync() {
    console.log('🔧 Manual sync triggered');
    await this.syncCallsToDaily();
  }
}

module.exports = new CallSyncService(); 