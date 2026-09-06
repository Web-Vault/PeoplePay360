const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Contract = require('../models/Contract');
const OvertimeChoice = require('../models/OvertimeChoice');
const TimeOffType = require('../models/TimeOffType');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const { calculate, getCurrentContract } = require('./contractService');

const dayStart = (date) => { const value = new Date(date); value.setHours(0, 0, 0, 0); return value; };
const dayEnd = (date) => { const value = dayStart(date); value.setDate(value.getDate() + 1); return value; };
const hours = (start, end) => Math.max(0, (new Date(end) - new Date(start)) / 3600000);

async function dailyLimit(userId, date) {
  const contract = await getCurrentContract(userId, dayStart(date), dayEnd(date));
  if (contract?.workStartTime && contract?.workEndTime) {
    const [sh, sm] = contract.workStartTime.split(':').map(Number); const [eh, em] = contract.workEndTime.split(':').map(Number);
    return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm) - Number(contract.breakMinutes || 0)) / 60);
  }
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
  const open = await Attendance.findOne({ userId, sessions: { $elemMatch: { $or: [{ checkOut: { $exists: false } }, { checkOut: null }] } } });
  if (open) throw Object.assign(new Error('You already have an open work session.'), { statusCode: 400 });
  const date = dayStart(at);
  const record = await Attendance.findOneAndUpdate({ userId, date }, { $setOnInsert: { userId, date, status: 'present' }, $push: { sessions: { checkIn: at } } }, { new: true, upsert: true });
  await refresh(record); return record;
}

async function checkOut(userId, at = new Date()) {
  const source = await Attendance.findOne({ userId, sessions: { $elemMatch: { $or: [{ checkOut: { $exists: false } }, { checkOut: null }] } } }).sort({ date: -1 });
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
async function list(filters) { const query = {}; if (filters.userId) query.userId = filters.userId; if (filters.from || filters.to) query.date = { ...(filters.from && { $gte: dayStart(filters.from) }), ...(filters.to && { $lte: dayStart(filters.to) }) }; return Attendance.find(query).populate('userId', 'name employeeCode').sort({ date: -1 }).limit(500).lean(); }
async function today(userId) {
  const date = dayStart(new Date());
  const [record, contract] = await Promise.all([Attendance.findOne({ userId, date }).lean(), getCurrentContract(userId)]);
  const requiredHours = await dailyLimit(userId, date); const pay = contract ? calculate(contract) : { gross: 0, net: 0 };
  const worked = Number(record?.workedHours || 0); const regularHours = Math.min(worked, requiredHours || worked);
  const overtime = Number(Math.max(Number(record?.overtimeHours || 0), worked - requiredHours, 0).toFixed(2)); const rate = Number(contract?.overtimeRate || 0);
  const dailyGross = requiredHours ? pay.gross / 22 * (regularHours / requiredHours) : 0; const dailyNet = requiredHours ? pay.net / 22 * (regularHours / requiredHours) : 0;
  const overtimePay = record?.overtimeChoice === 'cash' ? overtime * rate : 0;
  const payPerMinute = requiredHours ? dailyNet / requiredHours / 60 : 0;
  return { date, workedHours: worked, overtimeHours: overtime, requiredHours, dailyWage: Number((dailyNet + overtimePay).toFixed(2)), dailyGross: Number((dailyGross + overtimePay).toFixed(2)), payPerMinute: Number(payPerMinute.toFixed(2)), overtimePay: Number(overtimePay.toFixed(2)), overtimeChoice: record?.overtimeChoice, sessions: (record?.sessions || []).map((item) => ({ _id: item._id, startedAt: item.checkIn, endedAt: item.checkOut })) };
}
async function chooseOvertime(userId, date, choice) {
  if (!['cash', 'comp_time'].includes(choice)) throw Object.assign(new Error('Choose cash or comp_time.'), { statusCode: 400 });
  const record = await Attendance.findOne({ userId, date: dayStart(date) });
  if (!record?.overtimeHours) throw Object.assign(new Error('No eligible overtime found for this day.'), { statusCode: 400 });
  record.overtimeChoice = choice; await record.save();
  await OvertimeChoice.findOneAndUpdate({ userId, date: dayStart(date) }, { userId, date: dayStart(date), hours: record.overtimeHours, choice, status: choice === 'cash' ? 'pending' : 'converted' }, { upsert: true, new: true });
  if (choice === 'comp_time') {
    const type = await TimeOffType.findOne({ code: 'COMP', isActive: true });
    if (type) {
      const year = new Date(date).getFullYear();
      const days = Number((record.overtimeHours / 8).toFixed(2));
      await TimeOffAllocation.findOneAndUpdate({ userId, timeOffTypeId: type._id, year }, { $inc: { allocatedDays: days, remainingDays: days }, $setOnInsert: { validFrom: new Date(year, 0, 1), validTo: new Date(year, 11, 31) } }, { upsert: true });
    }
  }
  return record;
}
module.exports = { checkIn, checkOut, mine, list, today, chooseOvertime };
