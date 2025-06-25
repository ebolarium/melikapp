const express = require('express');
const router = express.Router();
const { sendDailyReport } = require('../services/reportService');

// Test endpoint to manually trigger daily report (development only)
router.post('/test-daily-report', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Test endpoint not available in production' });
    }
    
    await sendDailyReport();
    
    res.status(200).json({ 
      success: true, 
      message: 'Daily report sent successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router; 