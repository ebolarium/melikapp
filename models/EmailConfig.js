const mongoose = require('mongoose');

const emailConfigSchema = new mongoose.Schema({
  reportRecipients: {
    type: [String],
    required: true,
    default: ['baris@odakkimya.com.tr'],
    validate: {
      validator: function(recipients) {
        return recipients.every(email => /^\S+@\S+\.\S+$/.test(email));
      },
      message: 'All recipients must be valid email addresses'
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Ensure only one configuration document exists
// Remove the unique index as it may cause issues
// emailConfigSchema.index({}, { unique: true });

module.exports = mongoose.model('EmailConfig', emailConfigSchema); 