const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema = new Schema({
  employeeCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phone: {
    type: String
  },
  profileImage: {
    type: String
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    index: true
  },
  position: {
    type: String
  },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  joiningDate: {
    type: Date
  },
  scheduleId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkingSchedule'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active'
  },
  bankDetails: {
    accountHolderName: {
      type: String
    },
    accountNumber: {
      type: String
    },
    bankName: {
      type: String
    },
    ifsc: {
      type: String
    }
  },
  address: {
    street: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    postalCode: {
      type: String
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
