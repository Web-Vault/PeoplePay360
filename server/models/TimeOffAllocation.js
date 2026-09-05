const mongoose = require('mongoose');
const { Schema } = mongoose;

const timeOffAllocationSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  timeOffTypeId: {
    type: Schema.Types.ObjectId,
    ref: 'TimeOffType',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  allocatedDays: {
    type: Number,
    default: 0
  },
  usedDays: {
    type: Number,
    default: 0
  },
  remainingDays: {
    type: Number,
    default: 0
  },
  validFrom: {
    type: Date
  },
  validTo: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

timeOffAllocationSchema.index({ employeeId: 1, timeOffTypeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('TimeOffAllocation', timeOffAllocationSchema);
