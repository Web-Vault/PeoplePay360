const mongoose = require('mongoose');
const { Schema } = mongoose;

const payslipSchema = new Schema({
  payslipNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payrunId: {
    type: Schema.Types.ObjectId,
    ref: 'Payrun',
    index: true
  },
  contractId: {
    type: Schema.Types.ObjectId,
    ref: 'Contract'
  },
  employeeSnapshot: {
    employeeCode: {
      type: String
    },
    name: {
      type: String
    },
    department: {
      type: String
    },
    position: {
      type: String
    }
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  earnings: [{
    name: {
      type: String
    },
    code: {
      type: String
    },
    amount: {
      type: Number
    },
    category: {
      type: String
    }
  }],
  deductions: [{
    name: {
      type: String
    },
    code: {
      type: String
    },
    amount: {
      type: Number
    },
    category: {
      type: String
    }
  }],
  grossSalary: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  workedDays: {
    type: Number,
    default: 0
  },
  leaveDays: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'draft'
  },
  pdfUrl: {
    type: String
  }
}, {
  timestamps: true
});

payslipSchema.index({ userId: 1, periodStart: 1, periodEnd: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
