const mongoose = require('mongoose');
const { Schema } = mongoose;

const workSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  source: { type: String, enum: ['employee', 'manager'], default: 'employee' },
  note: String
}, { timestamps: true });
workSessionSchema.index({ userId: 1, startedAt: 1 });
module.exports = mongoose.model('WorkSession', workSessionSchema);
