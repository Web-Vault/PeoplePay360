const mongoose = require('mongoose');
const { Schema } = mongoose;

const payrollAuditSchema = new Schema({
  payrunId: {
    type: Schema.Types.ObjectId,
    ref: 'Payrun',
    index: true
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    index: true
  },
  payslipId: {
    type: Schema.Types.ObjectId,
    ref: 'Payslip'
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    required: true
  },
  type: {
    type: String,
    enum: ['missing_contract', 'expired_contract', 'salary_anomaly', 'duplicate_payslip', 'missing_bank_details', 'missing_checkout', 'excessive_overtime', 'calculation_error', 'missing_salary_structure', 'leave_balance_issue'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  recommendation: {
    type: String
  },
  data: {
    type: Schema.Types.Mixed
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PayrollAudit', payrollAuditSchema);
