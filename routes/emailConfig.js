const express = require('express');
const router = express.Router();
const simpleAuth = require('../middleware/simpleAuth');
const { getEmailConfig, updateEmailConfig } = require('../controllers/emailConfigController');

// Admin middleware to ensure only admins can access email configuration
const adminOnly = (req, res, next) => {
  if (req.user.level !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Get email configuration
// GET /api/email-config
router.get('/', simpleAuth, adminOnly, getEmailConfig);

// Update email configuration
// PUT /api/email-config
router.put('/', simpleAuth, adminOnly, updateEmailConfig);

module.exports = router; 