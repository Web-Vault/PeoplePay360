const { body } = require('express-validator');

const validateLogin = [
  body('email')
    .exists()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .exists()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

module.exports = { validateLogin };
