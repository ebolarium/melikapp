const express = require('express');
const router = express.Router();
const { sendDailyReport } = require('../services/reportService');
const CallRecord = require('../models/CallRecord');
const Company = require('../models/Company');

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

// Get companies with "Potansiyel" call results
router.get('/potential-companies', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Get call records with "Potansiyel" result directly from collection
    const records = await mongoose.connection.db.collection('callrecords').find({ callResult: "Potansiyel" }, { company: 1, callDate: 1 }).toArray();
    
    const uniqueCompanies = [];
    const companyIds = new Set();
    
    for (const record of records) {
      if (record.company && !companyIds.has(record.company.toString())) {
        companyIds.add(record.company.toString());
        
        // Get company details from companies collection
        const company = await mongoose.connection.db.collection('companies').findOne({ _id: record.company }, { companyName: 1, city: 1 });
        
        if (company) {
          uniqueCompanies.push({
            _id: company._id,
            companyName: company.companyName,
            city: company.city,
            lastCallDate: record.callDate
          });
        }
      }
    }
    
    // Sort by last call date (most recent first)
    uniqueCompanies.sort((a, b) => new Date(b.lastCallDate) - new Date(a.lastCallDate));

    res.status(200).json({
      success: true,
      companies: uniqueCompanies,
      total: uniqueCompanies.length
    });
  } catch (error) {
    console.error('Error fetching potential companies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 