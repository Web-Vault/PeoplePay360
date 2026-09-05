const { validationResult } = require('express-validator');
const userService = require('../services/userService');

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return true;
  }
  return false;
};

const listUsers = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const result = await userService.getAllUsers(req.query);
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const user = await userService.createUser(req.body, req.user._id);
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const user = await userService.updateUser(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    await userService.deleteUser(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const changeMyPassword = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user._id, currentPassword, newPassword);
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

const resetUserPassword = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const { newPassword } = req.body;
    await userService.resetPassword(req.params.id, newPassword);
    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const user = await userService.updateProfile(req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeMyPassword,
  resetUserPassword,
  updateMyProfile
};
