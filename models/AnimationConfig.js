const mongoose = require('mongoose');

const animationConfigSchema = new mongoose.Schema({
  peekAnimationEnabled: {
    type: Boolean,
    default: true,
    required: true
  },
  unicornAnimationEnabled: {
    type: Boolean,
    default: true,
    required: true
  },
  callAnimationsEnabled: {
    type: Boolean,
    default: true,
    required: true
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

module.exports = mongoose.model('AnimationConfig', animationConfigSchema); 