require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Contract = require('../models/Contract');
const WorkingSchedule = require('../models/WorkingSchedule');
const Attendance = require('../models/Attendance');
const TimeOffType = require('../models/TimeOffType');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const TimeOffRequest = require('../models/TimeOffRequest');
const SalaryStructure = require('../models/SalaryStructure');
const SalaryRule = require('../models/SalaryRule');
const Payrun = require('../models/Payrun');
const Payslip = require('../models/Payslip');
const PayrollAudit = require('../models/PayrollAudit');

const { connectDB } = require('../config/db');

const PASSWORD = 'Admin@123';
const BASIC_BY_CODE = {};

const pad = (n, len = 3) => String(n).padStart(len, '0');

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clearDB() {
  console.log('🗑 Clearing existing collections...');
  const collections = [
    User, Department, Employee, Contract, WorkingSchedule,
    Attendance, TimeOffType, TimeOffAllocation, TimeOffRequest,
    SalaryStructure, SalaryRule, Payrun, Payslip, PayrollAudit
  ];
  for (const Model of collections) {
    try { await Model.deleteMany({}); }
    catch (e) { console.warn(`  ⚠ Could not clear ${Model.modelName}: ${e.message}`); }
  }
  console.log('✅ Collections cleared');
}

async function seedDepartments() {
  console.log('🏢 Seeding departments...');
  const depts = [
    { name: 'Engineering', code: 'ENG', description: 'Software development, QA and DevOps teams', isActive: true },
    { name: 'Human Resources', code: 'HR', description: 'People operations, talent acquisition, employee engagement', isActive: true },
    { name: 'Finance', code: 'FIN', description: 'Accounts, payroll, taxation and compliance', isActive: true },
    { name: 'Sales', code: 'SAL', description: 'Client acquisition, business development, account management', isActive: true },
    { name: 'Operations', code: 'OPS', description: 'Office administration, IT support, facilities', isActive: true }
  ];
  const result = await Department.create(depts);
  const map = {};
  result.forEach(d => map[d.code] = d._id);
  console.log(`✅ ${result.length} departments created`);
  return map;
}

async function seedWorkingSchedules() {
  console.log('⏰ Seeding working schedules...');
  const scheds = [
    {
      name: 'Standard 5-Day (Mon-Fri 9am-6pm)',
      weeklyHours: 45,
      isActive: true,
      days: [
        { day: 'Monday',    startTime: '09:00', endTime: '18:00', breakMinutes: 60, isWorkingDay: true },
        { day: 'Tuesday',   startTime: '09:00', endTime: '18:00', breakMinutes: 60, isWorkingDay: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '18:00', breakMinutes: 60, isWorkingDay: true },
        { day: 'Thursday',  startTime: '09:00', endTime: '18:00', breakMinutes: 60, isWorkingDay: true },
        { day: 'Friday',    startTime: '09:00', endTime: '18:00', breakMinutes: 60, isWorkingDay: true },
        { day: 'Saturday',  startTime: '00:00', endTime: '00:00', breakMinutes: 0,  isWorkingDay: false },
        { day: 'Sunday',    startTime: '00:00', endTime: '00:00', breakMinutes: 0,  isWorkingDay: false }
      ]
    },
    {
      name: '5.5-Day (Mon-Sat 1/2)',
      weeklyHours: 48,
      isActive: true,
      days: [
        { day: 'Monday',    startTime: '09:30', endTime: '18:30', breakMinutes: 60, isWorkingDay: true },
        { day: 'Tuesday',   startTime: '09:30', endTime: '18:30', breakMinutes: 60, isWorkingDay: true },
        { day: 'Wednesday', startTime: '09:30', endTime: '18:30', breakMinutes: 60, isWorkingDay: true },
        { day: 'Thursday',  startTime: '09:30', endTime: '18:30', breakMinutes: 60, isWorkingDay: true },
        { day: 'Friday',    startTime: '09:30', endTime: '18:30', breakMinutes: 60, isWorkingDay: true },
        { day: 'Saturday',  startTime: '09:30', endTime: '13:30', breakMinutes: 0,  isWorkingDay: true },
        { day: 'Sunday',    startTime: '00:00', endTime: '00:00', breakMinutes: 0,  isWorkingDay: false }
      ]
    }
  ];
  const result = await WorkingSchedule.create(scheds);
  const map = { standard: result[0]._id, halfSat: result[1]._id };
  console.log(`✅ ${result.length} schedules created`);
  return map;
}

async function seedSalaryRules() {
  console.log('💰 Seeding salary rules...');
  const rules = [
    { name: 'Basic Salary',           code: 'BASIC',        category: 'basic',        sequence: 1,  calculationType: 'contract_basic', value: 0,          isActive: true },
    { name: 'House Rent Allowance',   code: 'HRA',          category: 'allowance',    sequence: 2,  calculationType: 'percentage',     value: 40,         basedOn: 'BASIC',  isActive: true },
    { name: 'Dearness Allowance',     code: 'DA',           category: 'allowance',    sequence: 3,  calculationType: 'percentage',     value: 12,         basedOn: 'BASIC',  isActive: true },
    { name: 'Special Allowance',      code: 'SPL_ALLOW',    category: 'allowance',    sequence: 4,  calculationType: 'formula',        formula: 'GROSS * 0.15', isActive: true },
    { name: 'Provident Fund (EE)',    code: 'PF_EE',        category: 'deduction',    sequence: 5,  calculationType: 'percentage',     value: 12,         basedOn: 'BASIC',  isActive: true },
    { name: 'Professional Tax',       code: 'PT',           category: 'deduction',    sequence: 6,  calculationType: 'fixed',          value: 200,        isActive: true },
    { name: 'Income Tax (TDS)',       code: 'TDS',          category: 'deduction',    sequence: 7,  calculationType: 'percentage',     value: 10,         basedOn: 'GROSS',  isActive: true },
    { name: 'Gross Salary',           code: 'GROSS',        category: 'gross',        sequence: 8,  calculationType: 'formula',        formula: 'BASIC + HRA + DA + SPL_ALLOW', isActive: true },
    { name: 'Net Salary',             code: 'NET',          category: 'net',          sequence: 9,  calculationType: 'formula',        formula: 'GROSS - PF_EE - PT - TDS', isActive: true }
  ];
  const result = await SalaryRule.create(rules);
  const map = {};
  result.forEach(r => map[r.code] = r._id);
  console.log(`✅ ${result.length} salary rules created`);
  return map;
}

async function seedSalaryStructures(ruleMap) {
  console.log('📊 Seeding salary structures...');
  const structs = [
    {
      name: 'Standard Full-Time Structure',
      code: 'STD_FT',
      description: 'Default structure for all full-time employees in India',
      ruleIds: [ruleMap.BASIC, ruleMap.HRA, ruleMap.DA, ruleMap.SPL_ALLOW, ruleMap.GROSS, ruleMap.PF_EE, ruleMap.PT, ruleMap.TDS, ruleMap.NET],
      isActive: true
    },
    {
      name: 'Probation / Contract Structure',
      code: 'PROBATION',
      description: 'Simplified structure for probation and contract hires with reduced benefits',
      ruleIds: [ruleMap.BASIC, ruleMap.HRA, ruleMap.GROSS, ruleMap.PT, ruleMap.NET],
      isActive: true
    }
  ];
  const result = await SalaryStructure.create(structs);
  const map = { std: result[0]._id, probation: result[1]._id };
  console.log(`✅ ${result.length} structures created`);
  return map;
}

async function seedEmployees(deptMap, scheduleMap) {
  console.log('👥 Seeding employees...');
  const rawData = [
    { code: 'PP360-001', firstName: 'Arjun',     lastName: 'Sharma',    email: 'arjun.sharma@peoplepay360.com',     phone: '+91-98765-43210', dept: 'ENG', position: 'Chief Technology Officer',      manager: null,              joining: new Date(2020, 0, 15), sched: 'standard',  status: 'active',     basic: 250000, bank: { holder: 'Arjun Sharma',          number: '1234567890', bank: 'HDFC Bank',    ifsc: 'HDFC0000123' }, addr: { street: '101, Skyline Apt, Bannerghatta Rd', city: 'Bengaluru', state: 'Karnataka', country: 'India', postalCode: '560076' } },
    { code: 'PP360-002', firstName: 'Priya',     lastName: 'Verma',     email: 'priya.verma@peoplepay360.com',      phone: '+91-98111-22334', dept: 'HR',  position: 'Head of Human Resources',      manager: null,              joining: new Date(2020, 2, 1),  sched: 'standard',  status: 'active',     basic: 180000, bank: { holder: 'Priya Verma',           number: '2233445566', bank: 'ICICI Bank',   ifsc: 'ICIC0000456' }, addr: { street: '45, Sector 29, Gurugram',              city: 'Gurugram',  state: 'Haryana',   country: 'India', postalCode: '122001' } },
    { code: 'PP360-003', firstName: 'Rohit',     lastName: 'Gupta',     email: 'rohit.gupta@peoplepay360.com',      phone: '+91-99887-76655', dept: 'FIN', position: 'Head of Finance',              manager: null,              joining: new Date(2020, 5, 20), sched: 'standard',  status: 'active',     basic: 200000, bank: { holder: 'Rohit Gupta',           number: '3344556677', bank: 'Axis Bank',    ifsc: 'UTIB0000789' }, addr: { street: 'A-302, Green Park',                     city: 'New Delhi', state: 'Delhi',     country: 'India', postalCode: '110016' } },
    { code: 'PP360-004', firstName: 'Sneha',     lastName: 'Iyer',      email: 'sneha.iyer@peoplepay360.com',       phone: '+91-99000-11122', dept: 'ENG', position: 'Engineering Manager',          manager: 'PP360-001',      joining: new Date(2021, 0, 10), sched: 'standard',  status: 'active',     basic: 160000, bank: { holder: 'Sneha Iyer',            number: '4455667788', bank: 'Kotak Mahindra', ifsc: 'KKBK0000012' }, addr: { street: '20, 7th Cross, Koramangala',            city: 'Bengaluru', state: 'Karnataka', country: 'India', postalCode: '560095' } },
    { code: 'PP360-005', firstName: 'Vikram',    lastName: 'Singh',     email: 'vikram.singh@peoplepay360.com',     phone: '+91-98220-33445', dept: 'SAL', position: 'Head of Sales',                manager: null,              joining: new Date(2021, 2, 5),  sched: 'halfSat',   status: 'active',     basic: 170000, bank: { holder: 'Vikram Singh',          number: '5566778899', bank: 'Yes Bank',     ifsc: 'YESB0000034' }, addr: { street: '12, Baner Road',                         city: 'Pune',      state: 'Maharashtra', country: 'India', postalCode: '411045' } },
    { code: 'PP360-006', firstName: 'Anita',     lastName: 'Desai',     email: 'anita.desai@peoplepay360.com',      phone: '+91-97654-32109', dept: 'OPS', position: 'Office & Operations Manager',  manager: null,              joining: new Date(2021, 5, 1),  sched: 'halfSat',   status: 'active',     basic: 95000,  bank: { holder: 'Anita Desai',           number: '6677889900', bank: 'Bank of Baroda', ifsc: 'BARB0CHD001' }, addr: { street: '604, Sector 17',                         city: 'Chandigarh',state: 'Punjab',    country: 'India', postalCode: '160017' } },
    { code: 'PP360-007', firstName: 'Karthik',   lastName: 'Raman',     email: 'karthik.raman@peoplepay360.com',    phone: '+91-99000-99888', dept: 'ENG', position: 'Senior Software Engineer',     manager: 'PP360-004',      joining: new Date(2021, 8, 15), sched: 'standard',  status: 'active',     basic: 130000, bank: { holder: 'Karthik Raman',         number: '7788990011', bank: 'IndusInd',     ifsc: 'INDB0000056' }, addr: { street: '8, Old Airport Road',                    city: 'Bengaluru', state: 'Karnataka', country: 'India', postalCode: '560017' } },
    { code: 'PP360-008', firstName: 'Meera',     lastName: 'Joshi',     email: 'meera.joshi@peoplepay360.com',      phone: '+91-98100-22330', dept: 'HR',  position: 'HR Executive',                 manager: 'PP360-002',      joining: new Date(2022, 0, 3),  sched: 'standard',  status: 'active',     basic: 60000,  bank: { holder: 'Meera Joshi',           number: '8899001122', bank: 'Punjab National', ifsc: 'PUNB0123456' }, addr: { street: 'B-17, Model Town',                       city: 'Jaipur',    state: 'Rajasthan', country: 'India', postalCode: '302001' } },
    { code: 'PP360-009', firstName: 'Nikhil',    lastName: 'Khan',      email: 'nikhil.khan@peoplepay360.com',      phone: '+91-99112-33440', dept: 'FIN', position: 'Payroll Executive',            manager: 'PP360-003',      joining: new Date(2022, 1, 20), sched: 'standard',  status: 'active',     basic: 65000,  bank: { holder: 'Nikhil Khan',           number: '9900112233', bank: 'Union Bank',   ifsc: 'UBIN0567890' }, addr: { street: '23, Park Street',                        city: 'Kolkata',   state: 'West Bengal', country: 'India', postalCode: '700016' } },
    { code: 'PP360-010', firstName: 'Ritu',      lastName: 'Nair',      email: 'ritu.nair@peoplepay360.com',        phone: '+91-98777-44556', dept: 'SAL', position: 'Sales Manager',                manager: 'PP360-005',      joining: new Date(2022, 3, 10), sched: 'halfSat',   status: 'active',     basic: 110000, bank: { holder: 'Ritu Nair',             number: '1011121314', bank: 'Federal Bank', ifsc: 'FDRL0000078' }, addr: { street: '304, Marine Drive Apts',                 city: 'Mumbai',    state: 'Maharashtra', country: 'India', postalCode: '400002' } },
    { code: 'PP360-011', firstName: 'Aditya',    lastName: 'Menon',     email: 'aditya.menon@peoplepay360.com',     phone: '+91-98450-12345', dept: 'ENG', position: 'Software Engineer',            manager: 'PP360-004',      joining: new Date(2022, 6, 1),  sched: 'standard',  status: 'active',     basic: 90000,  bank: { holder: 'Aditya Menon',          number: '1122334455', bank: 'IDFC First',   ifsc: 'IDFB0000090' }, addr: { street: '12, Indiranagar 100 Feet Rd',            city: 'Bengaluru', state: 'Karnataka', country: 'India', postalCode: '560038' } },
    { code: 'PP360-012', firstName: 'Kavya',     lastName: 'Bhat',      email: 'kavya.bhat@peoplepay360.com',       phone: '+91-97444-55667', dept: 'ENG', position: 'QA Engineer',                  manager: 'PP360-004',      joining: new Date(2022, 8, 5),  sched: 'standard',  status: 'active',     basic: 80000,  bank: { holder: 'Kavya Bhat',            number: '2233445501', bank: 'Canara Bank',  ifsc: 'CNRB0000321' }, addr: { street: '55, Balmatta Road',                      city: 'Mangaluru', state: 'Karnataka', country: 'India', postalCode: '575001' } },
    { code: 'PP360-013', firstName: 'Siddharth', lastName: 'Chopra',    email: 'siddharth.chopra@peoplepay360.com', phone: '+91-98888-11223', dept: 'SAL', position: 'Business Development Exec',    manager: 'PP360-010',      joining: new Date(2022, 10, 15),sched: 'halfSat',   status: 'active',     basic: 55000,  bank: { holder: 'Siddharth Chopra',      number: '3344550066', bank: 'Standard Ch.',  ifsc: 'SCBL0000011' }, addr: { street: '19, Civil Lines',                        city: 'New Delhi', state: 'Delhi',     country: 'India', postalCode: '110054' } },
    { code: 'PP360-014', firstName: 'Ananya',    lastName: 'Rao',       email: 'ananya.rao@peoplepay360.com',       phone: '+91-96111-00998', dept: 'FIN', position: 'Payroll Manager',              manager: 'PP360-003',      joining: new Date(2023, 0, 9),  sched: 'standard',  status: 'active',     basic: 140000, bank: { holder: 'Ananya Rao',            number: '4455001122', bank: 'RBL Bank',     ifsc: 'RATN0000065' }, addr: { street: '6, Boat Club Road',                      city: 'Pune',      state: 'Maharashtra', country: 'India', postalCode: '411001' } },
    { code: 'PP360-015', firstName: 'Sanjay',    lastName: 'Pillai',    email: 'sanjay.pillai@peoplepay360.com',    phone: '+91-99220-44778', dept: 'OPS', position: 'IT Support Engineer',          manager: 'PP360-006',      joining: new Date(2023, 2, 13), sched: 'halfSat',   status: 'active',     basic: 50000,  bank: { holder: 'Sanjay Pillai',         number: '5500667788', bank: 'Indian Bank',  ifsc: 'IDIB000C456' }, addr: { street: '42, Kaloor-Kadavanthra Rd',              city: 'Kochi',     state: 'Kerala',    country: 'India', postalCode: '682017' } },
    { code: 'PP360-016', firstName: 'Ishita',    lastName: 'Agarwal',   email: 'employee@peoplepay360.com',         phone: '+91-98110-33441', dept: 'ENG', position: 'Junior Software Engineer',     manager: 'PP360-004',      joining: new Date(2023, 5, 1),  sched: 'standard',  status: 'active',     basic: 55000,  bank: { holder: 'Ishita Agarwal',        number: '6600112233', bank: 'SBI',          ifsc: 'SBIN0001234' }, addr: { street: '8, Vibhuti Khand',                       city: 'Lucknow',   state: 'Uttar Pradesh', country: 'India', postalCode: '226010' } }
  ];

  rawData.forEach((r) => { BASIC_BY_CODE[r.code] = r.basic; });

  const employees = [];
  const byCode = {};
  for (let i = 0; i < rawData.length; i++) {
    const r = rawData[i];
    const emp = {
      employeeCode: r.code,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      phone: r.phone,
      profileImage: null,
      departmentId: deptMap[r.dept],
      position: r.position,
      joiningDate: r.joining,
      scheduleId: scheduleMap[r.sched],
      status: r.status,
      bankDetails: r.bank,
      address: r.addr
    };
    employees.push(emp);
  }

  const docs = await Employee.create(employees);
  docs.forEach(d => { byCode[d.employeeCode] = d; });

  for (let i = 0; i < rawData.length; i++) {
    const managerCode = rawData[i].manager;
    if (managerCode && byCode[managerCode]) {
      docs[i].managerId = byCode[managerCode]._id;
      await docs[i].save();
    }
  }

  console.log(`✅ ${docs.length} employees created`);
  return byCode;
}

async function seedContracts(empByCode, structMap, deptMap) {
  console.log('📄 Seeding contracts...');
  const items = [];
  const today = new Date();
  let seq = 1;
  Object.values(empByCode).forEach((emp) => {
    const start = new Date(emp.joiningDate || new Date(2023, 0, 1));
    const end = addDays(start, 365 * 3);
    const basic = BASIC_BY_CODE[emp.employeeCode] || 50000;
    const structId = basic >= 100000 ? structMap.std : structMap.probation;
    items.push({
      employeeId: emp._id,
      contractNumber: `CT-2024-${pad(seq++, 4)}`,
      startDate: start,
      endDate: end,
      basicSalary: basic,
      salaryStructureId: structId,
      departmentId: emp.departmentId,
      position: emp.position,
      status: today >= start && today <= end ? 'active' : (today > end ? 'expired' : 'draft'),
      revisionReason: 'Initial employment contract',
      approvedBy: null,
      approvedAt: start
    });
  });
  const result = await Contract.create(items);
  console.log(`✅ ${result.length} contracts created`);
  return result;
}

async function seedAttendance(empByCode) {
  console.log('📅 Seeding attendance records (last 30 days)...');
  const emps = Object.values(empByCode);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const all = [];
  const statuses = ['present', 'present', 'present', 'present', 'present', 'half_day', 'leave'];
  for (const emp of emps) {
    for (let i = 0; i < 30; i++) {
      const d = addDays(today, -i);
      const dow = d.getDay();
      if (dow === 0) continue;
      const status = dow === 6 ? (Math.random() > 0.5 ? 'present' : 'leave') : statuses[randomBetween(0, statuses.length - 1)];
      const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
      const checkIn = status === 'absent' || status === 'leave' || status === 'holiday'
        ? null
        : new Date(y, m, day, 9, randomBetween(0, 25), 0);
      const checkOut = !checkIn
        ? null
        : new Date(y, m, day, 18, randomBetween(0, 45), 0);
      let workedHours = 0;
      if (checkIn && checkOut) {
        workedHours = Math.max(0, (checkOut - checkIn) / 3_600_000 - 1);
      }
      const overtime = workedHours > 9 ? workedHours - 9 : 0;
      all.push({
        employeeId: emp._id,
        date: d,
        checkIn,
        checkOut,
        workedHours: Number(workedHours.toFixed(2)),
        overtimeHours: Number(overtime.toFixed(2)),
        status
      });
    }
  }
  const result = await Attendance.insertMany(all, { ordered: false }).catch((err) => {
    console.warn('  ⚠ Some attendance duplicates skipped:', err.message);
    return err.result ? err.result.getInsertedIds ? Object.values(err.result.getInsertedIds()) : [] : [];
  });
  const count = Array.isArray(result) ? result.length : 0;
  console.log(`✅ ${count} attendance records created`);
  return result;
}

async function seedTimeOffTypes() {
  console.log('🌴 Seeding time off types...');
  const types = [
    { name: 'Earned Leave',          code: 'EL',  unit: 'days', isPaid: true,  requiresApproval: true,  allocationRequired: true,  description: 'Annual earned leave accrued monthly',                 isActive: true },
    { name: 'Casual Leave',          code: 'CL',  unit: 'days', isPaid: true,  requiresApproval: true,  allocationRequired: true,  description: 'Short unplanned leave with prior notice',             isActive: true },
    { name: 'Sick Leave',            code: 'SL',  unit: 'days', isPaid: true,  requiresApproval: true,  allocationRequired: true,  description: 'Medical leave with certificate if >2 consecutive days', isActive: true },
    { name: 'Compensatory Off',      code: 'COMP',unit: 'days', isPaid: true,  requiresApproval: true,  allocationRequired: true,  description: 'Off against working on holidays / weekends',          isActive: true },
    { name: 'Leave Without Pay',     code: 'LWP', unit: 'days', isPaid: false, requiresApproval: true,  allocationRequired: false, description: 'Unpaid leave for personal reasons',                   isActive: true },
    { name: 'Maternity Leave',       code: 'MAT', unit: 'days', isPaid: true,  requiresApproval: true,  allocationRequired: false, description: 'Maternity benefit as per Maternity Benefit Act',      isActive: true },
    { name: 'Paternity Leave',       code: 'PAT', unit: 'days', isPaid: true,  requiresApproval: true,  allocationRequired: false, description: 'Paternity benefit for new fathers',                   isActive: true }
  ];
  const res = await TimeOffType.create(types);
  const map = {};
  res.forEach(r => map[r.code] = r._id);
  console.log(`✅ ${res.length} leave types created`);
  return map;
}

async function seedTimeOffAllocations(empByCode, typeMap) {
  console.log('📋 Seeding time off allocations (current year)...');
  const year = new Date().getFullYear();
  const emps = Object.values(empByCode);
  const allocations = [];
  const policy = { EL: [24, 12], CL: [12, 6], SL: [12, 6], COMP: [6, 2] };
  for (const emp of emps) {
    Object.keys(policy).forEach(code => {
      const [full, probation] = policy[code];
      const allocated = (BASIC_BY_CODE[emp.employeeCode] || 0) > 80000 ? full : probation;
      const used = randomBetween(0, Math.floor(allocated * 0.5));
      allocations.push({
        employeeId: emp._id,
        timeOffTypeId: typeMap[code],
        year,
        allocatedDays: allocated,
        usedDays: used,
        remainingDays: allocated - used,
        validFrom: new Date(year, 0, 1),
        validTo: new Date(year, 11, 31)
      });
    });
  }
  const result = await TimeOffAllocation.insertMany(allocations, { ordered: false }).catch(err => {
    console.warn('  ⚠ Duplicate allocations skipped:', err.message);
    return [];
  });
  console.log(`✅ ${Array.isArray(result) ? result.length : 0} allocations created`);
  return result;
}

async function seedTimeOffRequests(empByCode, typeMap) {
  console.log('📝 Seeding sample time off requests...');
  const emps = Object.values(empByCode);
  const requests = [];
  const codes = ['EL', 'CL', 'SL', 'COMP'];
  const statuses = ['approved', 'approved', 'pending', 'rejected'];
  const reasons = ['Family function', 'Fever / cold', 'Personal work', 'Planned vacation', 'Travel out of station', 'Medical appointment'];
  for (let i = 0; i < 15; i++) {
    const emp = emps[randomBetween(0, emps.length - 1)];
    const code = codes[randomBetween(0, codes.length - 1)];
    const status = statuses[randomBetween(0, statuses.length - 1)];
    const startOffset = randomBetween(-60, -5);
    const days = randomBetween(1, 4);
    const start = addDays(new Date(), startOffset);
    const end = addDays(start, days - 1);
    const item = {
      employeeId: emp._id,
      timeOffTypeId: typeMap[code],
      startDate: start,
      endDate: end,
      days,
      reason: reasons[randomBetween(0, reasons.length - 1)],
      status
    };
    if (status === 'approved') {
      item.approvedBy = Object.values(empByCode).find(e => e.employeeCode === 'PP360-002')?._id || null;
      item.approvedAt = start;
    } else if (status === 'rejected') {
      item.rejectedBy = Object.values(empByCode).find(e => e.employeeCode === 'PP360-002')?._id || null;
      item.rejectedAt = start;
      item.rejectionReason = 'Team capacity constraints during requested period';
    }
    requests.push(item);
  }
  const result = await TimeOffRequest.create(requests);
  console.log(`✅ ${result.length} leave requests created`);
  return result;
}

async function seedUsers(empByCode) {
  console.log('🔐 Seeding demo users (bcrypt hashed passwords)...');
  const hash = await bcrypt.hash(PASSWORD, 10);
  const findEmpByEmail = (email) => Object.values(empByCode).find(e => e.email === email);
  const now = new Date();

  const users = [
    {
      name: 'System Administrator',
      email: 'admin@peoplepay360.com',
      passwordHash: hash,
      role: 'admin',
      employeeId: null,
      phone: '+91-99999-00001',
      profilePicture: null,
      isActive: true,
      lastPasswordChange: now,
      createdBy: null
    },
    {
      name: 'Priya Verma',
      email: 'hr@peoplepay360.com',
      passwordHash: hash,
      role: 'hr_manager',
      employeeId: findEmpByEmail('priya.verma@peoplepay360.com')?._id || null,
      phone: '+91-98111-22334',
      profilePicture: null,
      isActive: true,
      lastPasswordChange: now,
      createdBy: null
    },
    {
      name: 'Nikhil Khan',
      email: 'payroll@peoplepay360.com',
      passwordHash: hash,
      role: 'payroll_user',
      employeeId: findEmpByEmail('nikhil.khan@peoplepay360.com')?._id || null,
      phone: '+91-99112-33440',
      profilePicture: null,
      isActive: true,
      lastPasswordChange: now,
      createdBy: null
    },
    {
      name: 'Ananya Rao',
      email: 'payrollmanager@peoplepay360.com',
      passwordHash: hash,
      role: 'payroll_manager',
      employeeId: findEmpByEmail('ananya.rao@peoplepay360.com')?._id || null,
      phone: '+91-96111-00998',
      profilePicture: null,
      isActive: true,
      lastPasswordChange: now,
      createdBy: null
    },
    {
      name: 'Ishita Agarwal',
      email: 'employee@peoplepay360.com',
      passwordHash: hash,
      role: 'employee',
      employeeId: findEmpByEmail('employee@peoplepay360.com')?._id || null,
      phone: '+91-98110-33441',
      profilePicture: null,
      isActive: true,
      lastPasswordChange: now,
      createdBy: null
    }
  ];
  const result = await User.create(users);
  const adminId = result[0]._id;
  await User.updateMany({ _id: { $ne: adminId } }, { $set: { createdBy: adminId } });
  console.log(`✅ ${result.length} users created — password: ${PASSWORD}`);
  return result;
}

async function seedPayrunsPayslips(empByCode, structMap, userDocs) {
  console.log('🧾 Seeding sample payruns, payslips, audits...');
  const emps = Object.values(empByCode);
  const y = new Date().getFullYear();
  const m = new Date().getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);

  const payrun = new Payrun({
    name: `August ${y} Monthly Payrun`,
    periodStart: start,
    periodEnd: end,
    salaryStructureId: structMap.std,
    employeeIds: emps.slice(0, 10).map(e => e._id),
    status: 'computed',
    employeeCount: 10,
    totalGross: 1180000,
    totalDeductions: 180000,
    totalNet: 1000000,
    auditScore: 92,
    criticalIssues: 0,
    warningIssues: 3,
    createdBy: userDocs.find(u => u.role === 'payroll_manager')?._id || userDocs[0]._id,
    computedAt: new Date()
  });
  await payrun.save();

  const payslips = [];
  const audits = [];
  for (const emp of emps.slice(0, 8)) {
    const basic = BASIC_BY_CODE[emp.employeeCode] || 50000;
    const hra = Math.round(basic * 0.4);
    const da = Math.round(basic * 0.12);
    const spl = Math.round((basic + hra + da) * 0.15);
    const gross = basic + hra + da + spl;
    const pf = Math.round(basic * 0.12);
    const pt = 200;
    const tds = Math.round(gross * 0.1);
    const net = gross - pf - pt - tds;
    const slipNumber = `PAYSLIP-${y}${pad(m + 1, 2)}-${pad(payslips.length + 1, 4)}`;
    const slip = {
      payslipNumber: slipNumber,
      employeeId: emp._id,
      payrunId: payrun._id,
      contractId: null,
      employeeSnapshot: {
        employeeCode: emp.employeeCode,
        name: `${emp.firstName} ${emp.lastName}`,
        department: '',
        position: emp.position
      },
      periodStart: start,
      periodEnd: end,
      earnings: [
        { name: 'Basic',        code: 'BASIC',     amount: basic, category: 'basic' },
        { name: 'HRA',          code: 'HRA',       amount: hra,   category: 'allowance' },
        { name: 'Dearness Allow', code: 'DA',      amount: da,    category: 'allowance' },
        { name: 'Special Allow', code: 'SPL_ALLOW', amount: spl,  category: 'allowance' }
      ],
      deductions: [
        { name: 'PF (Employee)', code: 'PF_EE',    amount: pf,    category: 'deduction' },
        { name: 'Professional Tax', code: 'PT',    amount: pt,    category: 'deduction' },
        { name: 'Income Tax',    code: 'TDS',      amount: tds,   category: 'deduction' }
      ],
      grossSalary: gross,
      totalDeductions: pf + pt + tds,
      netSalary: net,
      workedDays: 22,
      leaveDays: randomBetween(0, 2),
      overtimeHours: randomBetween(0, 12),
      status: 'draft'
    };
    payslips.push(slip);

    if ((BASIC_BY_CODE[emp.employeeCode] || 0) < 45000) {
      audits.push({
        payrunId: payrun._id,
        employeeId: emp._id,
        payslipId: null,
        severity: 'warning',
        type: 'salary_anomaly',
        message: `Employee ${emp.employeeCode} has relatively low basic for role ${emp.position}`,
        recommendation: 'Review salary alignment with role benchmark'
      });
    }
    if (slip.leaveDays && slip.leaveDays > 0) {
      audits.push({
        payrunId: payrun._id,
        employeeId: emp._id,
        payslipId: null,
        severity: 'info',
        type: 'leave_balance_issue',
        message: `Leave taken this period: ${slip.leaveDays} day(s) — verify leave balances before disbursal`,
        recommendation: 'Cross-check with HR records / leave system'
      });
    }
  }

  const slips = await Payslip.create(payslips);
  slips.forEach((slip, idx) => {
    if (audits[idx * 2]) audits[idx * 2].payslipId = slip._id;
  });

  audits.push({
    payrunId: payrun._id,
    employeeId: null,
    severity: 'info',
    type: 'missing_checkout',
    message: '3 employees have missing checkout days in attendance for this period',
    recommendation: 'Ask managers to confirm regularisation'
  });

  const auditDocs = await PayrollAudit.create(audits);
  console.log(`✅ 1 payrun, ${slips.length} payslips, ${auditDocs.length} payroll audits created`);
  return { payrun, slips, audits: auditDocs };
}

async function run() {
  const t0 = Date.now();
  console.log('\n🚀 PeoplePay360 — Development Database Seed\n');
  await connectDB();
  await clearDB();

  const deptMap = await seedDepartments();
  const scheduleMap = await seedWorkingSchedules();
  const ruleMap = await seedSalaryRules();
  const structMap = await seedSalaryStructures(ruleMap);
  const empByCode = await seedEmployees(deptMap, scheduleMap);
  await seedContracts(empByCode, structMap, deptMap);
  await seedAttendance(empByCode);
  const typeMap = await seedTimeOffTypes();
  await seedTimeOffAllocations(empByCode, typeMap);
  await seedTimeOffRequests(empByCode, typeMap);
  const userDocs = await seedUsers(empByCode);
  await seedPayrunsPayslips(empByCode, structMap, userDocs);

  console.log(`\n✨ Seed completed in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
  console.log('🔌 Disconnecting MongoDB...\n');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('💥 Seed failed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
