const { EmailConfig } = require('../models');

// Get email configuration
const getEmailConfig = async (req, res) => {
  try {
    console.log('🔍 Getting email config...');
    let config = await EmailConfig.findOne().populate('updatedBy', 'userName');
    console.log('📧 Found config:', config);
    
    // If no configuration exists, create default one
    if (!config) {
      console.log('📧 No config found, creating default...');
      config = new EmailConfig({
        reportRecipients: ['baris@odakkimya.com.tr'],
        updatedBy: req.user.id
      });
      await config.save();
      await config.populate('updatedBy', 'userName');
      console.log('📧 Created default config:', config);
    }

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error getting email configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving email configuration',
      error: error.message
    });
  }
};

// Update email configuration
const updateEmailConfig = async (req, res) => {
  try {
    const { reportRecipients } = req.body;
    console.log('💾 Updating email config with recipients:', reportRecipients);

    // Validate recipients
    if (!Array.isArray(reportRecipients) || reportRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one recipient email is required'
      });
    }

    // Validate email formats
    const emailRegex = /^\S+@\S+\.\S+$/;
    const invalidEmails = reportRecipients.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid email addresses: ${invalidEmails.join(', ')}`
      });
    }

    // Update or create configuration
    let config = await EmailConfig.findOne();
    console.log('📧 Existing config:', config);
    
    if (config) {
      console.log('📧 Updating existing config...');
      config.reportRecipients = reportRecipients;
      config.lastUpdated = new Date();
      config.updatedBy = req.user.id;
    } else {
      console.log('📧 Creating new config...');
      config = new EmailConfig({
        reportRecipients,
        updatedBy: req.user.id
      });
    }

    await config.save();
    console.log('📧 Saved config:', config);
    await config.populate('updatedBy', 'userName');

    res.json({
      success: true,
      data: config,
      message: 'Email configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating email configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email configuration',
      error: error.message
    });
  }
};

module.exports = {
  getEmailConfig,
  updateEmailConfig
}; 