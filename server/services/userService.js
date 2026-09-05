const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SALT_ROUNDS = 12;

const sanitizeUser = (user) => {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : user;
  delete u.passwordHash;
  delete u.passwordResetToken;
  delete u.passwordResetExpires;
  return {
    id: u._id,
    ...u,
    _id: undefined
  };
};

const getAllUsers = async (filters = {}) => {
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive === 'true';

  if (filters.search) {
    const s = filters.search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .populate('employeeId', 'firstName lastName employeeCode departmentId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query)
  ]);

  const sanitized = users.map(sanitizeUser);

  return {
    users: sanitized,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .populate('employeeId', 'firstName lastName employeeCode departmentId email phone')
    .populate('createdBy', 'name email')
    .lean();

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return sanitizeUser(user);
};

const createUser = async (data, createdById) => {
  const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    const err = new Error('A user with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = new User({
    name: data.name,
    email: data.email.toLowerCase().trim(),
    passwordHash,
    role: data.role,
    employeeId: data.employeeId || undefined,
    isActive: data.isActive !== undefined ? data.isActive : true,
    phone: data.phone || undefined,
    createdBy: createdById || undefined,
    lastPasswordChange: new Date()
  });

  await user.save();
  const populated = await User.findById(user._id)
    .populate('employeeId', 'firstName lastName employeeCode departmentId')
    .populate('createdBy', 'name email')
    .lean();
  return sanitizeUser(populated);
};

const updateUser = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.email && data.email.toLowerCase().trim() !== user.email) {
    const existing = await User.findOne({ email: data.email.toLowerCase().trim(), _id: { $ne: userId } });
    if (existing) {
      const err = new Error('A user with this email already exists');
      err.statusCode = 409;
      throw err;
    }
    user.email = data.email.toLowerCase().trim();
  }

  if (data.name !== undefined) user.name = data.name;
  if (data.role !== undefined) user.role = data.role;
  if (data.isActive !== undefined) user.isActive = data.isActive;
  if (data.phone !== undefined) user.phone = data.phone || undefined;
  if (data.employeeId !== undefined) {
    user.employeeId = data.employeeId || null;
  }

  await user.save();
  const refreshed = await User.findById(userId)
    .populate('employeeId', 'firstName lastName employeeCode departmentId')
    .populate('createdBy', 'name email')
    .lean();
  return sanitizeUser(refreshed);
};

const deleteUser = async (userId, currentUserId) => {
  if (String(userId) === String(currentUserId)) {
    const err = new Error('You cannot delete your own account');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  await User.findByIdAndDelete(userId);
  return sanitizeUser(user);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 400;
    throw err;
  }

  if (currentPassword === newPassword) {
    const err = new Error('New password must be different from current password');
    err.statusCode = 400;
    throw err;
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.lastPasswordChange = new Date();
  await user.save();

  return { success: true };
};

const resetPassword = async (userId, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.lastPasswordChange = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { success: true };
};

const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.name !== undefined) user.name = data.name;
  if (data.phone !== undefined) user.phone = data.phone || undefined;
  if (data.profilePicture !== undefined) user.profilePicture = data.profilePicture || undefined;

  await user.save();
  return sanitizeUser(user);
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword,
  updateProfile
};
