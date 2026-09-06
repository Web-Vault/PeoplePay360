const mongoose = require('mongoose');
const { Schema } = mongoose;

const contractSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractNumber: {
    type: String,
    required: true,
    unique: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: [{ name: String, amount: { type: Number, default: 0 } }],
  deductions: [{ name: String, amount: { type: Number, default: 0 } }],
  adjustments: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['addition', 'deduction'], required: true },
    amount: { type: Number, min: 0, required: true },
    effectiveMonth: { type: String, required: true },
    note: { type: String, default: '' }
  }],
  overtimeRate: { type: Number, default: 0 },
  workStartTime: { type: String, default: '09:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  workEndTime: { type: String, default: '18:00', match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  breakMinutes: { type: Number, default: 60, min: 0, max: 480 },
  salaryStructureId: {
    type: Schema.Types.ObjectId,
    ref: 'SalaryStructure'
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'expired', 'terminated'],
    default: 'draft'
  },
  revisionReason: {
    type: String
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

contractSchema.index({ userId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Contract', contractSchema);
