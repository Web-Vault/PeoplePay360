const { body, param } = require('express-validator');

const fields = [
  body('employeeCode').trim().notEmpty().withMessage('Employee ID is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('status').optional().isIn(['active', 'inactive', 'terminated']).withMessage('Invalid status'),
  body('joiningDate').optional({ checkFalsy: true }).isISO8601().withMessage('Use a valid joining date'),
  body('managerId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid manager'),
  body('departmentId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid department'),
  body('scheduleId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid schedule')
];

module.exports = { validateEmployee: fields, validateId: [param('id').isMongoId().withMessage('Invalid employee ID')] };
