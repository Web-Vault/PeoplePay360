const router = require('express').Router();
const { param } = require('express-validator');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const controller = require('../controllers/payrollController');
router.use(authenticate, authorizeRoles('admin', 'payroll_user', 'payroll_manager'));
router.get('/', controller.list);
router.get('/:id', [param('id').isMongoId()], controller.get);
module.exports = router;
