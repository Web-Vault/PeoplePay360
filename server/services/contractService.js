const Contract = require('../models/Contract');

const populate = [
  { path: 'userId', select: 'name firstName lastName email employeeCode position scheduleId', populate: { path: 'scheduleId', select: 'name weeklyHours' } },
  { path: 'departmentId', select: 'name code' },
  { path: 'salaryStructureId', select: 'name code ruleIds', populate: { path: 'ruleIds', select: 'name code category calculationType value basedOn formula sequence' } }
];

function money(value) { return Number(value || 0); }
function calculate(contract) {
  const rules = (contract.salaryStructureId?.ruleIds || []).sort((a, b) => a.sequence - b.sequence);
  const amounts = { BASIC: money(contract.basicSalary) };
  for (let pass = 0; pass < 3; pass++) rules.forEach((rule) => {
    if (rule.calculationType === 'contract_basic') amounts[rule.code] = money(contract.basicSalary);
    if (rule.calculationType === 'fixed') amounts[rule.code] = money(rule.value);
    if (rule.calculationType === 'percentage') amounts[rule.code] = money(amounts[rule.basedOn] || amounts.BASIC) * money(rule.value) / 100;
    if (rule.calculationType === 'formula' && rule.formula) {
      const expression = rule.formula.replace(/[A-Z_]+/g, (code) => String(amounts[code] || 0));
      if (/^[0-9.\s+*/()\-]+$/.test(expression)) amounts[rule.code] = Function(`return (${expression})`)();
    }
  });
  const ruleItems = rules.filter((rule) => !['gross', 'net'].includes(rule.category)).map((rule) => ({ name: rule.name, category: rule.category, amount: Math.round(money(amounts[rule.code])) }));
  const allowances = contract.allowances?.length ? contract.allowances : ruleItems.filter((item) => item.category === 'allowance');
  const deductions = contract.deductions?.length ? contract.deductions : ruleItems.filter((item) => item.category === 'deduction');
  const gross = money(contract.basicSalary) + allowances.reduce((sum, item) => sum + money(item.amount), 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + money(item.amount), 0);
  return { allowances, deductions, gross: Math.round(gross), totalDeductions: Math.round(totalDeductions), net: Math.round(gross - totalDeductions) };
}

async function listContracts() { const items = await Contract.find().populate(populate).sort({ startDate: -1 }).lean(); return items.map((contract) => ({ ...contract, pay: calculate(contract) })); }
async function getContract(id) { const contract = await Contract.findById(id).populate(populate).lean(); if (!contract) { const error = new Error('Contract not found'); error.statusCode = 404; throw error; } return { ...contract, pay: calculate(contract) }; }
async function updateContract(id, data) { await Contract.findByIdAndUpdate(id, data, { runValidators: true }); return getContract(id); }
module.exports = { listContracts, getContract, updateContract };
