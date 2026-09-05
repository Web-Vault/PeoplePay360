const Payrun = require('../models/Payrun');
const Payslip = require('../models/Payslip');
const PayrollAudit = require('../models/PayrollAudit');

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

module.exports = { listPayruns, getPayrun };
