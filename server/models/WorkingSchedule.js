const mongoose = require('mongoose');
const { Schema } = mongoose;

const workingScheduleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  weeklyHours: {
    type: Number,
    required: true,
    default: 40
  },
  dailyHours: { type: Number, default: 8, min: 0 },
  days: [{
    day: {
      type: String
    },
    startTime: {
      type: String
    },
    endTime: {
      type: String
    },
    breakMinutes: {
      type: Number,
      default: 0
    },
    isWorkingDay: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkingSchedule', workingScheduleSchema);
