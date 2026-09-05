const TimeOffRequest = require('../models/TimeOffRequest');
const TimeOffType = require('../models/TimeOffType');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const Payslip = require('../models/Payslip');
const Attendance = require('../models/Attendance');
const Payrun = require('../models/Payrun');
const User = require('../models/User');
const Contract = require('../models/Contract');

exports.myTimeOff = async (req, res, next) => { try { const [requests, allocations, types] = await Promise.all([TimeOffRequest.find({ userId: req.user._id }).populate('timeOffTypeId', 'name code').sort({ startDate: -1 }), TimeOffAllocation.find({ userId: req.user._id }).populate('timeOffTypeId', 'name code'), TimeOffType.find({ isActive: true })]); res.json({ success: true, data: { requests, allocations, types } }); } catch (error) { next(error); } };
exports.requestTimeOff = async (req, res, next) => { try { const { timeOffTypeId, startDate, endDate, reason } = req.body; const days = Math.max(1, Math.floor((new Date(endDate) - new Date(startDate)) / 86400000) + 1); const request = await TimeOffRequest.create({ userId: req.user._id, timeOffTypeId, startDate, endDate, days, reason }); res.status(201).json({ success: true, data: { request } }); } catch (error) { next(error); } };
exports.myPayslips = async (req, res, next) => { try { const slips = await Payslip.find({ userId: req.user._id }).sort({ periodEnd: -1 }).lean(); res.json({ success: true, data: { payslips: slips } }); } catch (error) { next(error); } };
exports.dashboard = async (req, res, next) => { try { if (req.user.role === 'employee') { const start = new Date(); start.setHours(0, 0, 0, 0); const [today, latestSlip, pending] = await Promise.all([Attendance.findOne({ userId: req.user._id, date: start }).lean(), Payslip.findOne({ userId: req.user._id }).sort({ periodEnd: -1 }).lean(), TimeOffRequest.countDocuments({ userId: req.user._id, status: 'pending' })]); return res.json({ success: true, data: { type: 'employee', today: { workedHours: today?.workedHours || 0, overtimeHours: today?.overtimeHours || 0, dailyEarnings: latestSlip?.workedDays ? Number((latestSlip.netSalary / latestSlip.workedDays).toFixed(2)) : 0 }, latestPayslip: latestSlip, pendingLeave: pending } }); }
    const [employees, contracts, payrun, attendanceToday] = await Promise.all([User.countDocuments({ role: 'employee', employmentStatus: 'active' }), Contract.countDocuments({ status: 'active' }), Payrun.findOne().sort({ periodEnd: -1 }).lean(), Attendance.countDocuments({ date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }, status: 'present' })]); res.json({ success: true, data: { type: 'management', employees, activeContracts: contracts, attendanceToday, payrun } }); } catch (error) { next(error); } };
