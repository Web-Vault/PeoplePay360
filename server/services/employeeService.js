const User = require('../models/User');
const bcrypt = require('bcryptjs');

const refs = [
  { path: 'departmentId', select: 'name code' },
  { path: 'managerId', select: 'firstName lastName employeeCode position name' },
  { path: 'scheduleId', select: 'name weeklyHours' }
];

const listEmployees = async ({ search = '', status = '', page = 1, limit = 20 }) => {
  const query = { role: 'employee' };
  if (status) query.employmentStatus = status;
  if (search.trim()) {
    const term = search.trim();
    query.$or = ['employeeCode', 'firstName', 'lastName', 'email', 'position'].map((field) => ({ [field]: { $regex: term, $options: 'i' } }));
  }
  const numericPage = Math.max(Number(page) || 1, 1);
  const numericLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const [employees, total] = await Promise.all([
    User.find(query).populate(refs).sort({ createdAt: -1 }).skip((numericPage - 1) * numericLimit).limit(numericLimit).lean(),
    User.countDocuments(query)
  ]);
  return { employees, pagination: { page: numericPage, limit: numericLimit, total, pages: Math.ceil(total / numericLimit) } };
};

const getEmployee = async (id) => {
  const employee = await User.findOne({ _id: id, role: 'employee' }).populate(refs).lean();
  if (!employee) { const error = new Error('Employee not found'); error.statusCode = 404; throw error; }
  return employee;
};

const createEmployee = async (payload) => {
  const passwordHash = await bcrypt.hash(require('crypto').randomBytes(24).toString('hex'), 12);
  const employee = await User.create({ ...payload, name: `${payload.firstName} ${payload.lastName}`.trim(), role: 'employee', isActive: false, employmentStatus: payload.status || 'active', passwordHash });
  return getEmployee(employee._id);
};

const updateEmployee = async (id, payload) => {
  const update = { ...payload, name: `${payload.firstName} ${payload.lastName}`.trim(), employmentStatus: payload.status || 'active' };
  delete update.status;
  const employee = await User.findOneAndUpdate({ _id: id, role: 'employee' }, update, { new: true, runValidators: true });
  if (!employee) { const error = new Error('Employee not found'); error.statusCode = 404; throw error; }
  return getEmployee(employee._id);
};

module.exports = { listEmployees, getEmployee, createEmployee, updateEmployee };
