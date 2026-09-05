const router = require('express').Router();
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const controller = require('../controllers/salaryController');

const roles = ['admin', 'payroll_manager'];
const id = [param('id').isMongoId()];
const ruleFields = [body('name').trim().isLength({ min: 2, max: 100 }), body('code').trim().matches(/^[A-Za-z][A-Za-z0-9_]*$/), body('category').isIn(['basic', 'allowance', 'gross', 'deduction', 'net']), body('sequence').optional().isInt({ min: 0 }), body('calculationType').isIn(['fixed', 'percentage', 'formula', 'contract_basic']), body('value').optional().isFloat({ min: 0 }), body('basedOn').optional().trim().matches(/^[A-Za-z][A-Za-z0-9_]*$/), body('formula').optional().trim().isLength({ max: 200 }), body('isActive').optional().isBoolean()];
const structureFields = [body('name').trim().isLength({ min: 2, max: 100 }), body('code').trim().matches(/^[A-Za-z][A-Za-z0-9_]*$/), body('description').optional().trim().isLength({ max: 500 }), body('ruleIds').isArray(), body('ruleIds.*').isMongoId(), body('isActive').optional().isBoolean()];

router.use(authenticate, authorizeRoles(...roles));
router.get('/rules', controller.listRules);
router.post('/rules', ruleFields, controller.createRule);
router.get('/rules/:id', id, controller.getRule);
router.put('/rules/:id', [...id, ...ruleFields], controller.updateRule);
router.delete('/rules/:id', id, controller.removeRule);
router.get('/structures', controller.listStructures);
router.post('/structures', structureFields, controller.createStructure);
router.get('/structures/:id', id, controller.getStructure);
router.put('/structures/:id', [...id, ...structureFields], controller.updateStructure);
router.delete('/structures/:id', id, controller.removeStructure);

module.exports = router;
