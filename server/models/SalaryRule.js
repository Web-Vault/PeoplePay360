const mongoose = require('mongoose');
const { Schema } = mongoose;

const salaryRuleSchema = new Schema({
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
  category: {
    type: String,
    enum: ['basic', 'allowance', 'gross', 'deduction', 'net'],
    required: true
  },
  sequence: {
    type: Number,
    default: 0
  },
  calculationType: {
    type: String,
    enum: ['fixed', 'percentage', 'formula', 'contract_basic'],
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  basedOn: {
    type: String
  },
  formula: {
    type: String
  },
  condition: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalaryRule', salaryRuleSchema);
