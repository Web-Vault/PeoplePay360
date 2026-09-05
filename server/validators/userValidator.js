const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const ROLES = ['admin', 'hr_manager', 'payroll_user', 'payroll_manager', 'employee'];

const passwordRule = (field = 'password') =>
  body(field)
    .exists()
    .withMessage(`${field} is required`)
    .isLength({ min: 8 })
    .withMessage(`${field} must be at least 8 characters long`)
    .matches(/[A-Z]/)
    .withMessage(`${field} must contain at least one uppercase letter`)
    .matches(/[a-z]/)
    .withMessage(`${field} must contain at least one lowercase letter`)
    .matches(/[0-9]/)
    .withMessage(`${field} must contain at least one number`);

const validateCreateUser = [
  body('name')
    .exists()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  body('email')
    .exists()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  passwordRule('password'),
  body('role')
    .exists()
    .withMessage('Role is required')
    .isIn(ROLES)
    .withMessage(`Invalid role. Valid roles: ${ROLES.join(', ')}`),
  body('employeeId')
    .optional()
    .custom((v) => {
      if (v && !mongoose.Types.ObjectId.isValid(v)) {
        throw new Error('Invalid employeeId format');
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone must be at most 20 characters')
    .trim()
];

const validateUpdateUser = [
  param('id')
    .exists()
    .custom((v) => {
      if (!mongoose.Types.ObjectId.isValid(v)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    }),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('role')
    .optional()
    .isIn(ROLES)
    .withMessage(`Invalid role. Valid roles: ${ROLES.join(', ')}`),
  body('employeeId')
    .optional({ nullable: true })
    .custom((v) => {
      if (v !== null && v !== undefined && !mongoose.Types.ObjectId.isValid(v)) {
        throw new Error('Invalid employeeId format');
      }
      return true;
    }),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone must be at most 20 characters')
    .trim()
];

const validateGetUser = [
  param('id')
    .exists()
    .custom((v) => {
      if (!mongoose.Types.ObjectId.isValid(v)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    })
];

const validateDeleteUser = [
  param('id')
    .exists()
    .custom((v) => {
      if (!mongoose.Types.ObjectId.isValid(v)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    })
];

const validateChangePassword = [
  body('currentPassword')
    .exists()
    .withMessage('Current password is required')
    .isLength({ min: 8 })
    .withMessage('Current password must be at least 8 characters long'),
  passwordRule('newPassword')
];

const validateResetPassword = [
  param('id')
    .exists()
    .custom((v) => {
      if (!mongoose.Types.ObjectId.isValid(v)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    }),
  passwordRule('newPassword')
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone must be at most 20 characters')
    .trim(),
  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL')
    .trim()
];

const validateListUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(ROLES)
    .withMessage(`Invalid role filter. Valid: ${ROLES.join(', ')}`),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search must be at most 100 characters')
    .trim()
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateGetUser,
  validateDeleteUser,
  validateChangePassword,
  validateResetPassword,
  validateUpdateProfile,
  validateListUsers
};
