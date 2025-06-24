const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  person: {
    type: String,
    trim: true,
    maxlength: [50, 'Person name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  production: {
    type: String,
    enum: {
      values: ['Boyahane', 'Konfeksiyon', 'Diğer'],
      message: 'Production must be Boyahane, Konfeksiyon, or Diğer'
    }
  },
  brands: [{
    type: String,
    enum: {
      values: ['X-Rite', 'SDL Atlas', 'Pantone'],
      message: 'Brand must be X-Rite, SDL Atlas, or Pantone'
    }
  }],
  spectro: {
    type: String,
    enum: {
      values: ['Xrite', 'Datacolor', 'Minolta', 'Hunterlab', 'İhtiyaç Yok', 'Diğer', 'bilinmiyor'],
      message: 'Spectro must be Xrite, Datacolor, Minolta, Hunterlab, İhtiyaç Yok, Diğer, or bilinmiyor'
    }
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  spectroAge: {
    type: String,
    enum: {
      values: ['Eski', 'Orta', 'Yeni', 'Belirtilmemiş'],
      message: 'Spectro age must be Eski, Orta, or Yeni'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastContactDate: {
    type: Date
  },
  totalCalls: {
    type: Number,
    default: 0,
    min: [0, 'Total calls cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster searches
companySchema.index({ companyName: 1 });
companySchema.index({ city: 1 });
companySchema.index({ production: 1 });
companySchema.index({ createdBy: 1 });
companySchema.index({ assignedTo: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company; 