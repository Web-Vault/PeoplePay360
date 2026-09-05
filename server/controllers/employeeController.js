const { validationResult } = require('express-validator');
const employeeService = require('../services/employeeService');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  return true;
};

const listEmployees = async (req, res, next) => { try { if (!validate(req, res)) res.json({ success: true, data: await employeeService.listEmployees(req.query) }); } catch (error) { next(error); } };
const getEmployee = async (req, res, next) => { try { res.json({ success: true, data: { employee: await employeeService.getEmployee(req.params.id) } }); } catch (error) { next(error); } };
const createEmployee = async (req, res, next) => { try { if (!validate(req, res)) res.status(201).json({ success: true, data: { employee: await employeeService.createEmployee(req.body) } }); } catch (error) { next(error); } };
const updateEmployee = async (req, res, next) => { try { if (!validate(req, res)) res.json({ success: true, data: { employee: await employeeService.updateEmployee(req.params.id, req.body) } }); } catch (error) { next(error); } };

module.exports = { listEmployees, getEmployee, createEmployee, updateEmployee };
