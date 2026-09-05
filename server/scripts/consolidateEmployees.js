require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { connectDB } = require('../config/db');
const Employee = require('../models/Employee');
const User = require('../models/User');

const related = [
  ['attendances', 'employeeId'], ['contracts', 'employeeId'], ['timeoffallocations', 'employeeId'],
  ['timeoffrequests', 'employeeId'], ['payslips', 'employeeId'], ['payrollaudits', 'employeeId']
];

async function run() {
  await connectDB();
  const employees = await Employee.find().lean();
  const users = await User.find().select('+passwordHash').lean();
  const byEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]));
  const duplicateEmails = employees.filter((employee, index) => employees.findIndex((item) => item.email.toLowerCase() === employee.email.toLowerCase()) !== index);
  if (duplicateEmails.length) throw new Error('Migration stopped: duplicate employee emails found. No data changed.');

  const map = new Map();
  for (const employee of employees) {
    let user = byEmail.get(employee.email.toLowerCase());
    const profile = { name: `${employee.firstName} ${employee.lastName}`.trim(), firstName: employee.firstName, lastName: employee.lastName, employeeCode: employee.employeeCode, phone: employee.phone, profilePicture: employee.profileImage, departmentId: employee.departmentId, position: employee.position, joiningDate: employee.joiningDate, scheduleId: employee.scheduleId, employmentStatus: employee.status, bankDetails: employee.bankDetails, address: employee.address };
    if (user) {
      await User.updateOne({ _id: user._id }, { $set: profile, $unset: { employeeId: '' } });
    } else {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 12);
      const created = await User.create({ ...profile, email: employee.email, role: 'employee', isActive: false, passwordHash });
      user = created.toObject();
    }
    map.set(String(employee._id), user._id);
  }
  for (const [collection, field] of related) {
    const indexes = await mongoose.connection.db.collection(collection).indexes();
    for (const index of indexes) {
      if (index.name !== '_id_' && Object.prototype.hasOwnProperty.call(index.key, field)) {
        await mongoose.connection.db.collection(collection).dropIndex(index.name);
      }
    }
  }
  for (const employee of employees) {
    if (employee.managerId) await User.updateOne({ _id: map.get(String(employee._id)) }, { $set: { managerId: map.get(String(employee.managerId)) } });
  }
  for (const [collection, field] of related) {
    const docs = await mongoose.connection.db.collection(collection).find({ [field]: { $exists: true } }).toArray();
    for (const doc of docs) {
      if (!doc[field]) { await mongoose.connection.db.collection(collection).updateOne({ _id: doc._id }, { $unset: { [field]: '' } }); continue; }
      const userId = map.get(String(doc[field]));
      if (!userId) throw new Error(`Migration stopped: ${collection} contains an unmapped employee reference.`);
      await mongoose.connection.db.collection(collection).updateOne({ _id: doc._id }, { $set: { userId }, $unset: { [field]: '' } });
    }
  }
  const payruns = await mongoose.connection.db.collection('payruns').find({ employeeIds: { $exists: true } }).toArray();
  for (const run of payruns) { const userIds = run.employeeIds.map((value) => map.get(String(value))); if (userIds.some((value) => !value)) throw new Error('Migration stopped: payrun contains an unmapped employee reference.'); await mongoose.connection.db.collection('payruns').updateOne({ _id: run._id }, { $set: { userIds }, $unset: { employeeIds: '' } }); }
  const departments = await mongoose.connection.db.collection('departments').find({ managerId: { $exists: true } }).toArray();
  for (const department of departments) { const managerId = map.get(String(department.managerId)); if (managerId) await mongoose.connection.db.collection('departments').updateOne({ _id: department._id }, { $set: { managerId } }); }
  await mongoose.connection.db.collection('employees').drop();
  console.log(`Consolidated ${employees.length} employee profiles into users; old employees collection removed.`);
  await mongoose.disconnect();
}
run().catch(async (error) => { console.error(error.message); await mongoose.disconnect(); process.exit(1); });
