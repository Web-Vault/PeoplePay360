const payroll = require('../services/payrollService');
exports.list = async (_req, res, next) => { try { res.json({ success: true, data: { payruns: await payroll.listPayruns() } }); } catch (error) { next(error); } };
exports.get = async (req, res, next) => { try { res.json({ success: true, data: { payrun: await payroll.getPayrun(req.params.id) } }); } catch (error) { next(error); } };
exports.current = async (_req, res, next) => { try { res.json({ success: true, data: await payroll.currentProjection() }); } catch (error) { next(error); } };
exports.employee = async (req, res, next) => { try { res.json({ success: true, data: await payroll.employeePayroll(req.params.userId) }); } catch (error) { next(error); } };
