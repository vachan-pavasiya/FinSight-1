const { prisma } = require('../config/prisma');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ success: false, error: 'Email in use' });
  
  const hash = await authService.hashPassword(password);
  const emailVerifyToken = uuidv4();
  
  const user = await prisma.user.create({
    data: { name, email, password: hash, emailVerifyToken }
  });
  
  await emailService.sendVerificationEmail(email, emailVerifyToken);
  res.status(201).json({ success: true, message: 'Verification email sent' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await authService.comparePassword(password, user.password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  if (!user.isEmailVerified) return res.status(403).json({ success: false, error: 'Email not verified' });
  
  const accessToken = authService.generateAccessToken(user.id, user.role);
  const refreshToken = authService.generateRefreshToken(user.id);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt }
  });
  
  res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken } });
};

const refresh = async (req, res) => {
  const token = req.headers.cookie?.split('refreshToken=')[1]?.split(';')[0];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  
  const dbToken = await prisma.refreshToken.findUnique({ where: { token } });
  if (!dbToken || dbToken.expiresAt < new Date()) {
    if (dbToken) await prisma.refreshToken.delete({ where: { token } });
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
  
  const payload = authService.verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  
  const newAccess = authService.generateAccessToken(user.id, user.role);
  const newRefresh = authService.generateRefreshToken(user.id);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await prisma.refreshToken.delete({ where: { token } });
  await prisma.refreshToken.create({ data: { token: newRefresh, userId: user.id, expiresAt } });
  
  res.cookie('refreshToken', newRefresh, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ success: true, data: { accessToken: newAccess } });
};

const logout = async (req, res) => {
  const token = req.headers.cookie?.split('refreshToken=')[1]?.split(';')[0];
  if (token) await prisma.refreshToken.deleteMany({ where: { token } });
  res.clearCookie('refreshToken');
  res.json({ success: true });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const resetPasswordToken = uuidv4();
    const resetPasswordExpiry = new Date(Date.now() + 3600000);
    await prisma.user.update({ where: { id: user.id }, data: { resetPasswordToken, resetPasswordExpiry } });
    await emailService.sendPasswordResetEmail(email, resetPasswordToken);
  }
  res.json({ success: true, message: 'If email exists, reset sent' });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const user = await prisma.user.findFirst({ where: { resetPasswordToken: token, resetPasswordExpiry: { gt: new Date() } } });
  if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired token' });
  
  const hash = await authService.hashPassword(password);
  await prisma.user.update({ where: { id: user.id }, data: { password: hash, resetPasswordToken: null, resetPasswordExpiry: null } });
  res.json({ success: true });
};

const verifyEmail = async (req, res) => {
  const { token } = req.body;
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) return res.status(400).json({ success: false, error: 'Invalid token' });
  
  await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true, emailVerifyToken: null } });
  res.json({ success: true });
};

module.exports = { signup, login, refresh, logout, forgotPassword, resetPassword, verifyEmail };
