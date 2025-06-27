const express = require('express');
const router = express.Router();
const simpleAuth = require('../middleware/simpleAuth');
const { getAnimationConfig, updateAnimationConfig } = require('../controllers/animationConfigController');

// Admin middleware to ensure only admins can access animation configuration
const adminOnly = (req, res, next) => {
  if (req.user.level !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Get animation configuration
// GET /api/animation-config
router.get('/', simpleAuth, adminOnly, getAnimationConfig);

// Update animation configuration
// PUT /api/animation-config
router.put('/', simpleAuth, adminOnly, updateAnimationConfig);

module.exports = router; 