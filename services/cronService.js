const cron = require('node-cron');
const { sendDailyReport } = require('./reportService');
const DailyRecordService = require('./dailyRecordService');

/**
 * Initialize cron jobs
 */
const initCronJobs = () => {
  // Daily report at 19:00 Turkey time (GMT+3)
  cron.schedule('0 19 * * *', async () => {
    console.log('Running daily report cron job...');
    try {
      await sendDailyReport();
      console.log('Daily report sent successfully');
    } catch (error) {
      console.error('Daily report cron job failed:', error);
    }
  }, {
    timezone: "Europe/Istanbul"
  });

  // Create daily records at 00:00 Turkey time (GMT+3) - only on workdays
  cron.schedule('0 0 * * 1-5', async () => {
    console.log('Running daily record creation cron job...');
    try {
      await DailyRecordService.createDailyRecordsForDate();
      console.log('Daily records created successfully');
    } catch (error) {
      console.error('Daily record creation cron job failed:', error);
    }
  }, {
    timezone: "Europe/Istanbul"
  });
  
  console.log('Cron jobs initialized:');
  console.log('- Daily report scheduled for 19:00 Turkey time');
  console.log('- Daily record creation scheduled for 00:00 Turkey time (workdays only)');
};

/**
 * Initialize daily records on server startup
 */
const initDailyRecords = async () => {
  try {
    await DailyRecordService.initializeDailyRecords();
  } catch (error) {
    console.error('Failed to initialize daily records on startup:', error);
  }
};

module.exports = {
  initCronJobs,
  initDailyRecords
}; 