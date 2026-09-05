const mongoose = require('mongoose');
const { Schema } = mongoose;

const contractSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
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

contractSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Contract', contractSchema);
