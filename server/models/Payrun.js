const mongoose = require('mongoose');
const { Schema } = mongoose;

const payrunSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  salaryStructureId: {
    type: Schema.Types.ObjectId,
    ref: 'SalaryStructure'
  },
  userIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['draft', 'computed', 'validated', 'paid', 'cancelled'],
    default: 'draft'
  },
  employeeCount: {
    type: Number,
    default: 0
  },
  totalGross: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  totalNet: {
    type: Number,
    default: 0
  },
  auditScore: {
    type: Number,
    default: 0
  },
  criticalIssues: {
    type: Number,
    default: 0
  },
  warningIssues: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  computedAt: {
    type: Date
  },
  validatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
    type: Date
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

payrunSchema.index({ periodStart: 1, periodEnd: 1 });

module.exports = mongoose.model('Payrun', payrunSchema);
