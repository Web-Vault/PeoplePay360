const SalaryRule = require('../models/SalaryRule');
const SalaryStructure = require('../models/SalaryStructure');
const Contract = require('../models/Contract');

const structurePopulate = { path: 'ruleIds', select: 'name code category sequence calculationType value basedOn formula isActive' };

async function listRules() {
  return SalaryRule.find().sort({ sequence: 1, name: 1 }).lean();
}

async function getRule(id) {
  const rule = await SalaryRule.findById(id).lean();
  if (!rule) { const error = new Error('Salary rule not found'); error.statusCode = 404; throw error; }
  return rule;
}

async function createRule(data) {
  return SalaryRule.create({ ...data, code: data.code.toUpperCase().trim() });
}

async function updateRule(id, data) {
  if (data.code) data.code = data.code.toUpperCase().trim();
  const rule = await SalaryRule.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!rule) { const error = new Error('Salary rule not found'); error.statusCode = 404; throw error; }
  return rule;
}

async function removeRule(id) {
  const usedBy = await SalaryStructure.exists({ ruleIds: id });
  if (usedBy) { const error = new Error('This rule is used by a salary structure. Remove it from the structure or deactivate it instead.'); error.statusCode = 409; throw error; }
  const rule = await SalaryRule.findByIdAndDelete(id);
  if (!rule) { const error = new Error('Salary rule not found'); error.statusCode = 404; throw error; }
}

async function listStructures() {
  return SalaryStructure.find().populate(structurePopulate).sort({ name: 1 }).lean();
}

async function getStructure(id) {
  const structure = await SalaryStructure.findById(id).populate(structurePopulate).lean();
  if (!structure) { const error = new Error('Salary structure not found'); error.statusCode = 404; throw error; }
  return structure;
}

async function createStructure(data) {
  const structure = await SalaryStructure.create({ ...data, code: data.code.toUpperCase().trim() });
  return getStructure(structure._id);
}

async function updateStructure(id, data) {
  if (data.code) data.code = data.code.toUpperCase().trim();
  const structure = await SalaryStructure.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!structure) { const error = new Error('Salary structure not found'); error.statusCode = 404; throw error; }
  return getStructure(id);
}

async function removeStructure(id) {
  const usedBy = await Contract.exists({ salaryStructureId: id });
  if (usedBy) { const error = new Error('This structure is assigned to a contract. Deactivate it instead of deleting it.'); error.statusCode = 409; throw error; }
  const structure = await SalaryStructure.findByIdAndDelete(id);
  if (!structure) { const error = new Error('Salary structure not found'); error.statusCode = 404; throw error; }
}

module.exports = { listRules, getRule, createRule, updateRule, removeRule, listStructures, getStructure, createStructure, updateStructure, removeStructure };
