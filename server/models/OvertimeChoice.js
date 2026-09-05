const mongoose = require('mongoose');
const { Schema } = mongoose;
const overtimeChoiceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true, min: 0 },
  choice: { type: String, enum: ['cash', 'comp_time'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid', 'converted'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
overtimeChoiceSchema.index({ userId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('OvertimeChoice', overtimeChoiceSchema);
