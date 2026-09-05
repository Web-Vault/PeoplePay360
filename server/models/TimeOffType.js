const mongoose = require('mongoose');
const { Schema } = mongoose;

const timeOffTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  unit: {
    type: String,
    enum: ['days', 'hours'],
    default: 'days'
  },
  isPaid: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: true
  },
  allocationRequired: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TimeOffType', timeOffTypeSchema);
