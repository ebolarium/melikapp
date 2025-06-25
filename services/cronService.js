const cron = require('node-cron');
const { sendDailyReport } = require('./reportService');

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
  
  console.log('Cron jobs initialized - Daily report scheduled for 19:00 Turkey time');
};

module.exports = {
  initCronJobs
}; 