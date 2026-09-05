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
  overtimeRate: { type: Number, default: 0 },
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
