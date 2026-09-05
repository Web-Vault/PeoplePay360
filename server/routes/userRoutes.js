const express = require('express');
const router = express.Router();

const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeMyPassword,
  resetUserPassword,
  updateMyProfile
} = require('../controllers/userController');

const {
  validateCreateUser,
  validateUpdateUser,
  validateGetUser,
  validateDeleteUser,
  validateChangePassword,
  validateResetPassword,
  validateUpdateProfile,
  validateListUsers
} = require('../validators/userValidator');

const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const ADMIN_ONLY = ['admin'];
const ALL_ROLES = ['admin', 'hr_manager', 'payroll_user', 'payroll_manager', 'employee'];

router.use(authenticate);

router.get(
  '/',
  authorizeRoles(...ADMIN_ONLY),
  validateListUsers,
  listUsers
);

router.get(
  '/:id',
  authorizeRoles(...ADMIN_ONLY),
  validateGetUser,
  getUser
);

router.post(
  '/',
  authorizeRoles(...ADMIN_ONLY),
  validateCreateUser,
  createUser
);

router.put(
  '/:id',
  authorizeRoles(...ADMIN_ONLY),
  validateUpdateUser,
  updateUser
);

router.delete(
  '/:id',
  authorizeRoles(...ADMIN_ONLY),
  validateDeleteUser,
  deleteUser
);

router.put(
  '/:id/reset-password',
  authorizeRoles(...ADMIN_ONLY),
  validateResetPassword,
  resetUserPassword
);

router.put(
  '/me/profile',
  authorizeRoles(...ALL_ROLES),
  validateUpdateProfile,
  updateMyProfile
);

router.put(
  '/me/change-password',
  authorizeRoles(...ALL_ROLES),
  validateChangePassword,
  changeMyPassword
);

module.exports = router;
