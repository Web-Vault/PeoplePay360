require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');

const pairs = [
  ['hr@peoplepay360.com', 'priya.verma@peoplepay360.com'],
  ['payroll@peoplepay360.com', 'nikhil.khan@peoplepay360.com'],
  ['payrollmanager@peoplepay360.com', 'ananya.rao@peoplepay360.com']
];

async function run() {
  await connectDB();
  const db = mongoose.connection.db;
  for (const [loginEmail, profileEmail] of pairs) {
    const account = await User.findOne({ email: loginEmail });
    const profile = await User.findOne({ email: profileEmail, role: 'employee' }).lean();
    if (!account || !profile) throw new Error(`Expected records missing for ${loginEmail}; nothing was changed.`);
    const profileFields = ['employeeCode', 'firstName', 'lastName', 'departmentId', 'position', 'joiningDate', 'scheduleId', 'employmentStatus', 'profilePicture', 'phone', 'bankDetails', 'address'];
    const update = { workEmail: profile.email };
    profileFields.forEach((field) => { update[field] = profile[field]; });
    await User.updateOne({ _id: account._id }, { $set: update });
    for (const collection of ['attendances', 'contracts', 'timeoffallocations', 'timeoffrequests', 'payslips', 'payrollaudits']) await db.collection(collection).updateMany({ userId: profile._id }, { $set: { userId: account._id } });
    await db.collection('payruns').updateMany({ userIds: profile._id }, { $set: { 'userIds.$': account._id } });
    await User.updateMany({ managerId: profile._id }, { $set: { managerId: account._id } });
    await db.collection('departments').updateMany({ managerId: profile._id }, { $set: { managerId: account._id } });
    await User.deleteOne({ _id: profile._id });
  }
  console.log('Merged 3 confirmed employee/login pairs.');
  await mongoose.disconnect();
}
run().catch(async (error) => { console.error(error.message); await mongoose.disconnect(); process.exit(1); });
