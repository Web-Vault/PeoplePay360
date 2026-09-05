const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'hr_manager', 'payroll_user', 'payroll_manager', 'employee'],
    required: true
  },
  employeeCode: { type: String, unique: true, sparse: true, trim: true, index: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  position: { type: String, trim: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  joiningDate: { type: Date },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'WorkingSchedule' },
  employmentStatus: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
  phone: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  workEmail: { type: String, lowercase: true, trim: true },
  bankDetails: {
    accountHolderName: String, accountNumber: String, bankName: String, ifsc: String
  },
  address: { street: String, city: String, state: String, country: String, postalCode: String },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  lastPasswordChange: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
