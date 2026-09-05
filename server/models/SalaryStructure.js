const mongoose = require('mongoose');
const { Schema } = mongoose;

const salaryStructureSchema = new Schema({
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
  description: {
    type: String
  },
  ruleIds: [{
    type: Schema.Types.ObjectId,
    ref: 'SalaryRule'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
