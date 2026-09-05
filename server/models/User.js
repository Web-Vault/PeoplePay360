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
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  phone: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
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
userSchema.index({ employeeId: 1 });

module.exports = mongoose.model('User', userSchema);
