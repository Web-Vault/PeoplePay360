const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  sessions: [{
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
    hours: { type: Number, default: 0 }
  }],
  workedHours: {
    type: Number
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  overtimeChoice: { type: String, enum: ['cash', 'comp_time'] },
  status: {
    type: String,
    enum: ['present', 'absent', 'half_day', 'leave', 'holiday'],
    default: 'present'
  },
  correctionReason: {
    type: String
  },
  correctedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
