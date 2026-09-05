const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Contract = require('../models/Contract');

const dayStart = (date) => { const value = new Date(date); value.setHours(0, 0, 0, 0); return value; };
const dayEnd = (date) => { const value = dayStart(date); value.setDate(value.getDate() + 1); return value; };
const hours = (start, end) => Math.max(0, (new Date(end) - new Date(start)) / 3600000);

async function dailyLimit(userId, date) {
  const user = await User.findById(userId).populate('scheduleId');
  const schedule = user?.scheduleId;
  if (!schedule) return 8;
  const name = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  const day = schedule.days?.find((item) => item.day === name);
  if (!day?.isWorkingDay) return 0;
  const [sh, sm] = (day.startTime || '09:00').split(':').map(Number);
  const [eh, em] = (day.endTime || '17:00').split(':').map(Number);
  return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm) - (day.breakMinutes || 0)) / 60);
}

async function refresh(record) {
  record.workedHours = Number(record.sessions.reduce((sum, item) => sum + (item.hours || 0), 0).toFixed(2));
  record.overtimeHours = Number(Math.max(0, record.workedHours - await dailyLimit(record.userId, record.date)).toFixed(2));
  record.checkIn = record.sessions[0]?.checkIn;
  record.checkOut = record.sessions.every((item) => item.checkOut) ? record.sessions[record.sessions.length - 1]?.checkOut : undefined;
  await record.save();
}

async function checkIn(userId, at = new Date()) {
  const open = await Attendance.findOne({ userId, 'sessions.checkOut': { $exists: false } });
  if (open) throw Object.assign(new Error('You already have an open work session.'), { statusCode: 400 });
  const date = dayStart(at);
  const record = await Attendance.findOneAndUpdate({ userId, date }, { $setOnInsert: { userId, date, status: 'present' }, $push: { sessions: { checkIn: at } } }, { new: true, upsert: true });
  await refresh(record); return record;
}

async function checkOut(userId, at = new Date()) {
  const source = await Attendance.findOne({ userId, 'sessions.checkOut': { $exists: false } }).sort({ date: -1 });
  if (!source) throw Object.assign(new Error('No open work session found.'), { statusCode: 400 });
  const session = source.sessions.find((item) => !item.checkOut);
  if (new Date(at) <= new Date(session.checkIn)) throw Object.assign(new Error('Check-out must be after check-in.'), { statusCode: 400 });
  const start = new Date(session.checkIn); const end = new Date(at); const originalDate = dayStart(start);
  source.sessions = source.sessions.filter((item) => String(item._id) !== String(session._id));
  let cursor = start;
  while (cursor < end) {
    const boundary = dayEnd(cursor); const segmentEnd = end < boundary ? end : boundary; const date = dayStart(cursor);
    const record = String(date) === String(originalDate) ? source : await Attendance.findOneAndUpdate({ userId, date }, { $setOnInsert: { userId, date, status: 'present' } }, { new: true, upsert: true });
    record.sessions.push({ checkIn: cursor, checkOut: segmentEnd, hours: Number(hours(cursor, segmentEnd).toFixed(2)) });
    await refresh(record); cursor = segmentEnd;
  }
  return Attendance.find({ userId, date: { $gte: dayStart(start), $lte: dayStart(end) } }).sort({ date: 1 });
}

async function mine(userId, from, to) { const query = { userId }; if (from || to) query.date = { ...(from && { $gte: dayStart(from) }), ...(to && { $lte: dayStart(to) }) }; return Attendance.find(query).sort({ date: -1 }).lean(); }
async function list(filters) { const query = {}; if (filters.userId) query.userId = filters.userId; return Attendance.find(query).populate('userId', 'name employeeCode').sort({ date: -1 }).limit(200).lean(); }
async function today(userId) { const date = dayStart(new Date()); const [record, contract] = await Promise.all([Attendance.findOne({ userId, date }).lean(), Contract.findOne({ userId, status: 'active' }).lean()]); const requiredHours = await dailyLimit(userId, date); const base = contract?.basicSalary || 0; const overtimeRate = contract?.overtimeRate || 0; return { date, workedHours: record?.workedHours || 0, overtimeHours: record?.overtimeHours || 0, requiredHours, dailyWage: Number((base / 22).toFixed(2)), overtimePay: Number(((record?.overtimeHours || 0) * overtimeRate).toFixed(2)), overtimeChoice: record?.overtimeChoice, sessions: (record?.sessions || []).map((item) => ({ _id: item._id, startedAt: item.checkIn, endedAt: item.checkOut })) }; }
async function chooseOvertime(userId, date, choice) { if (!['cash', 'comp_time'].includes(choice)) throw Object.assign(new Error('Choose cash or comp_time.'), { statusCode: 400 }); const record = await Attendance.findOne({ userId, date: dayStart(date) }); if (!record?.overtimeHours) throw Object.assign(new Error('No eligible overtime found for this day.'), { statusCode: 400 }); record.overtimeChoice = choice; await record.save(); return record; }
module.exports = { checkIn, checkOut, mine, list, today, chooseOvertime };
