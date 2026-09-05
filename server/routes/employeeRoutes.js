const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { listEmployees, getEmployee, createEmployee, updateEmployee } = require('../controllers/employeeController');
const { validateEmployee, validateId } = require('../validators/employeeValidator');

const router = express.Router();
const MANAGERS = ['admin', 'hr_manager', 'payroll_user', 'payroll_manager'];
router.use(authenticate, authorizeRoles(...MANAGERS));
router.get('/', listEmployees);
router.get('/:id', validateId, getEmployee);
router.post('/', validateEmployee, createEmployee);
router.put('/:id', validateId, validateEmployee, updateEmployee);
module.exports = router;
