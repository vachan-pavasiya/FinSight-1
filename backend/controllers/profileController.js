const { prisma } = require('../config/prisma');
const authService = require('../services/authService');

const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id:true, name:true, email:true, role:true, isEmailVerified:true, createdAt:true } });
  res.json({ success: true, data: user });
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { name, email }, select: { id:true, name:true, email:true } });
  res.json({ success: true, data: user });
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await authService.comparePassword(currentPassword, user.password))) {
    return res.status(400).json({ success: false, error: 'Incorrect current password' });
  }
  const hash = await authService.hashPassword(newPassword);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hash } });
  res.json({ success: true });
};

module.exports = { getProfile, updateProfile, updatePassword };
