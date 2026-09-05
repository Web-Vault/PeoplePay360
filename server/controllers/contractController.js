const { validationResult } = require('express-validator');
const contracts = require('../services/contractService');
const check = (req, res) => { const errors = validationResult(req); if (errors.isEmpty()) return false; res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() }); return true; };
exports.listContracts = async (_req, res, next) => { try { res.json({ success: true, data: { contracts: await contracts.listContracts() } }); } catch (error) { next(error); } };
exports.getContract = async (req, res, next) => { try { res.json({ success: true, data: { contract: await contracts.getContract(req.params.id) } }); } catch (error) { next(error); } };
exports.updateContract = async (req, res, next) => { try { if (!check(req, res)) res.json({ success: true, data: { contract: await contracts.updateContract(req.params.id, req.body) } }); } catch (error) { next(error); } };
