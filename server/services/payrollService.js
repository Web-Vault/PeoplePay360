const Payrun = require('../models/Payrun');
const Payslip = require('../models/Payslip');
const PayrollAudit = require('../models/PayrollAudit');
require('../models/User');
require('../models/WorkingSchedule');
require('../models/SalaryStructure');
require('../models/SalaryRule');
const Attendance = require('../models/Attendance');
const Contract = require('../models/Contract');
const TimeOffRequest = require('../models/TimeOffRequest');
const { calculate, selectCurrentContract } = require('./contractService');

function dailyLimit(schedule, date) {
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  const day = schedule?.days?.find((item) => item.day === dayName);
  if (!day) return 8;
  if (!day.isWorkingDay) return 0;
  const [startHour, startMinute] = (day.startTime || '09:00').split(':').map(Number);
  const [endHour, endMinute] = (day.endTime || '17:00').split(':').map(Number);
  return Math.max(0, ((endHour * 60 + endMinute) - (startHour * 60 + startMinute) - Number(day.breakMinutes || 0)) / 60);
}

async function listPayruns() {
  return Payrun.find()
    .populate('createdBy validatedBy', 'name email')
    .sort({ periodEnd: -1 })
    .lean();
}

async function getPayrun(id) {
  const payrun = await Payrun.findById(id).populate('userIds', 'name employeeCode email').lean();
  if (!payrun) { const error = new Error('Pay run not found'); error.statusCode = 404; throw error; }
  const [payslips, audits] = await Promise.all([
    Payslip.find({ payrunId: id }).populate('userId', 'name employeeCode email').sort({ netSalary: -1 }).lean(),
    PayrollAudit.find({ payrunId: id }).populate('userId', 'name employeeCode').sort({ createdAt: -1 }).lean()
  ]);
  return { ...payrun, payslips, audits };
}

async function currentProjection() {
  const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const contracts = await Contract.find({ status: { $in: ['active', 'expired'] } }).populate([{ path: 'userId', select: 'name email employeeCode role scheduleId employmentStatus', populate: { path: 'scheduleId', select: 'name weeklyHours days' } }, { path: 'salaryStructureId', populate: { path: 'ruleIds' } }]).lean();
  const byUser = new Map();
  contracts.filter((contract) => contract.userId?.role === 'employee' && contract.userId?.employmentStatus === 'active').forEach((contract) => { const key = String(contract.userId._id); byUser.set(key, [...(byUser.get(key) || []), contract]); });
  const currentContracts = [...byUser.values()].map((items) => selectCurrentContract(items, start, end)).filter(Boolean);
  const rows = await Promise.all(currentContracts.map(async (contract) => {
    const [attendance, pay] = await Promise.all([Attendance.find({ userId: contract.userId._id, date: { $gte: start, $lte: end } }).lean(), Promise.resolve(calculate(contract))]);
    const workedDays = attendance.filter((item) => item.workedHours > 0).length;
    const workedHours = attendance.reduce((sum, item) => sum + Number(item.workedHours || 0), 0);
    const overtimeFor = (item) => Math.max(Number(item.overtimeHours || 0), Number((Number(item.workedHours || 0) - dailyLimit(contract.userId.scheduleId, item.date)).toFixed(2)), 0);
    const overtimeHours = attendance.reduce((sum, item) => sum + overtimeFor(item), 0);
    const cashOvertime = attendance.filter((item) => item.overtimeChoice === 'cash').reduce((sum, item) => sum + overtimeFor(item), 0);
    const dailyGross = pay.gross / 22; const dailyNet = pay.net / 22;
    return { userId: contract.userId._id, name: contract.userId.name, employeeCode: contract.userId.employeeCode, contractId: contract._id, contractStatus: contract.status, monthlyGross: pay.gross, monthlyDeductions: pay.totalDeductions, monthlyNet: pay.net, workedDays, workedHours: Number(workedHours.toFixed(2)), overtimeHours: Number(overtimeHours.toFixed(2)), cashOvertimeHours: Number(cashOvertime.toFixed(2)), overtimePay: Number((cashOvertime * Number(contract.overtimeRate || 0)).toFixed(2)), earnedGross: Number((workedDays * dailyGross + cashOvertime * Number(contract.overtimeRate || 0)).toFixed(2)), earnedNet: Number((workedDays * dailyNet + cashOvertime * Number(contract.overtimeRate || 0)).toFixed(2)) };
  }));
  return { periodStart: start, periodEnd: end, employees: rows, totals: { employees: rows.length, gross: rows.reduce((sum, row) => sum + row.earnedGross, 0), net: rows.reduce((sum, row) => sum + row.earnedNet, 0), overtimeHours: rows.reduce((sum, row) => sum + row.overtimeHours, 0) } };
}

async function employeePayroll(userId) {
  const projection = await currentProjection();
  const row = projection.employees.find((item) => String(item.userId) === String(userId));
  if (!row) { const error = new Error('No current payroll profile found for this employee'); error.statusCode = 404; throw error; }
  const [contract, history, unpaidLeaves] = await Promise.all([
    Contract.findById(row.contractId).populate([{ path: 'userId', select: 'name employeeCode email position' }, { path: 'salaryStructureId', populate: { path: 'ruleIds' } }]).lean(),
    Payslip.find({ userId }).sort({ periodEnd: -1 }).limit(3).lean(),
    TimeOffRequest.find({ userId, status: 'approved', startDate: { $gte: projection.periodStart }, endDate: { $lte: projection.periodEnd } }).populate('timeOffTypeId', 'name isPaid').lean()
  ]);
  const pay = calculate(contract);
  const unpaidDays = unpaidLeaves.filter((leave) => leave.timeOffTypeId && !leave.timeOffTypeId.isPaid).reduce((sum, leave) => sum + Number(leave.days || 0), 0);
  const leaveDeduction = Number((unpaidDays * pay.net / 22).toFixed(2));
  const earnedSoFar = Number((row.earnedNet - leaveDeduction).toFixed(2));
  const projectedMonthPay = Number((pay.net + row.overtimePay - leaveDeduction).toFixed(2));
  return { ...row, employee: contract.userId, contract: { basicSalary: contract.basicSalary, allowances: pay.allowances, deductions: pay.deductions, gross: pay.gross, net: pay.net, overtimeRate: contract.overtimeRate }, overtime: { cashHours: row.cashOvertimeHours, cashAmount: row.overtimePay, unallocatedHours: Number((row.overtimeHours - row.cashOvertimeHours).toFixed(2)) }, unpaidLeave: { days: unpaidDays, deduction: leaveDeduction }, earnedSoFar, projectedMonthPay, history };
}

module.exports = { listPayruns, getPayrun, currentProjection, employeePayroll };
