const { validationResult } = require('express-validator');
const salary = require('../services/salaryService');

const valid = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return true;
  res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  return false;
};

exports.listRules = async (_req, res, next) => { try { res.json({ success: true, data: { rules: await salary.listRules() } }); } catch (error) { next(error); } };
exports.getRule = async (req, res, next) => { try { res.json({ success: true, data: { rule: await salary.getRule(req.params.id) } }); } catch (error) { next(error); } };
exports.createRule = async (req, res, next) => { try { if (valid(req, res)) res.status(201).json({ success: true, data: { rule: await salary.createRule(req.body) } }); } catch (error) { next(error); } };
exports.updateRule = async (req, res, next) => { try { if (valid(req, res)) res.json({ success: true, data: { rule: await salary.updateRule(req.params.id, req.body) } }); } catch (error) { next(error); } };
exports.removeRule = async (req, res, next) => { try { await salary.removeRule(req.params.id); res.json({ success: true, message: 'Salary rule deleted' }); } catch (error) { next(error); } };
exports.listStructures = async (_req, res, next) => { try { res.json({ success: true, data: { structures: await salary.listStructures() } }); } catch (error) { next(error); } };
exports.getStructure = async (req, res, next) => { try { res.json({ success: true, data: { structure: await salary.getStructure(req.params.id) } }); } catch (error) { next(error); } };
exports.createStructure = async (req, res, next) => { try { if (valid(req, res)) res.status(201).json({ success: true, data: { structure: await salary.createStructure(req.body) } }); } catch (error) { next(error); } };
exports.updateStructure = async (req, res, next) => { try { if (valid(req, res)) res.json({ success: true, data: { structure: await salary.updateStructure(req.params.id, req.body) } }); } catch (error) { next(error); } };
exports.removeStructure = async (req, res, next) => { try { await salary.removeStructure(req.params.id); res.json({ success: true, message: 'Salary structure deleted' }); } catch (error) { next(error); } };
