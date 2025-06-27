const { AnimationConfig } = require('../models');

// Get animation configuration
const getAnimationConfig = async (req, res) => {
  try {
    console.log('🎬 Getting animation config...');
    let config = await AnimationConfig.findOne().populate('updatedBy', 'userName');
    console.log('🎬 Found config:', config);
    
    // If no configuration exists, create default one
    if (!config) {
      console.log('🎬 No config found, creating default...');
      config = new AnimationConfig({
        peekAnimationEnabled: true,
        unicornAnimationEnabled: true,
        callAnimationsEnabled: true,
        updatedBy: req.user.id
      });
      await config.save();
      await config.populate('updatedBy', 'userName');
      console.log('🎬 Created default config:', config);
    }

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error getting animation configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving animation configuration',
      error: error.message
    });
  }
};

// Update animation configuration
const updateAnimationConfig = async (req, res) => {
  try {
    const { peekAnimationEnabled, unicornAnimationEnabled, callAnimationsEnabled } = req.body;
    console.log('💾 Updating animation config with settings:', req.body);

    // Validate boolean values
    if (typeof peekAnimationEnabled !== 'boolean' || 
        typeof unicornAnimationEnabled !== 'boolean' || 
        typeof callAnimationsEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'All animation settings must be boolean values'
      });
    }

    // Update or create configuration
    let config = await AnimationConfig.findOne();
    console.log('🎬 Existing config:', config);
    
    if (config) {
      console.log('🎬 Updating existing config...');
      config.peekAnimationEnabled = peekAnimationEnabled;
      config.unicornAnimationEnabled = unicornAnimationEnabled;
      config.callAnimationsEnabled = callAnimationsEnabled;
      config.lastUpdated = new Date();
      config.updatedBy = req.user.id;
    } else {
      console.log('🎬 Creating new config...');
      config = new AnimationConfig({
        peekAnimationEnabled,
        unicornAnimationEnabled,
        callAnimationsEnabled,
        updatedBy: req.user.id
      });
    }

    await config.save();
    console.log('🎬 Saved config:', config);
    await config.populate('updatedBy', 'userName');

    res.json({
      success: true,
      data: config,
      message: 'Animation configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating animation configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating animation configuration',
      error: error.message
    });
  }
};

module.exports = {
  getAnimationConfig,
  updateAnimationConfig
}; 