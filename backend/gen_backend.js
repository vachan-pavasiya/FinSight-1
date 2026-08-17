const fs = require('fs');
const path = require('path');

const write = (p, content) => {
  const fullPath = path.join(__dirname, p);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

// 1. config/env.js
write('config/env.js', `
const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_SECRET: z.string().min(16),
  REFRESH_EXPIRES_IN: z.string().default('7d'),
  ANALYTICS_URL: z.string().url().default('http://localhost:8000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MAX_FILE_SIZE: z.coerce.number().default(10485760),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten());
  process.exit(1);
}
module.exports = { env: parsed.data };
`);

// 2. config/prisma.js
write('config/prisma.js', `
const { PrismaClient } = require('@prisma/client');
const { env } = require('./env');

const prismaGlobal = global.prisma || new PrismaClient();
if (env.NODE_ENV !== 'production') {
  global.prisma = prismaGlobal;
}
module.exports = { prisma: prismaGlobal };
`);

// 3. config/swagger.js
write('config/swagger.js', `
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'FinSight API', version: '1.0.0' },
  paths: {
    '/health': { get: { summary: 'Health check', responses: { 200: { description: 'OK' } } } }
  }
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
module.exports = { setupSwagger };
`);

// 4. services/emailService.js
write('services/emailService.js', `
const nodemailer = require('nodemailer');

let transporter;
nodemailer.createTestAccount().then(account => {
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass }
  });
}).catch(console.error);

const sendVerificationEmail = async (to, token) => {
  const info = await transporter.sendMail({
    from: '"FinSight" <noreply@finsight.com>',
    to,
    subject: 'Verify your email',
    text: \`Your token is \${token}\`
  });
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};
const sendPasswordResetEmail = async (to, token) => {
  const info = await transporter.sendMail({
    from: '"FinSight" <noreply@finsight.com>',
    to,
    subject: 'Reset Password',
    text: \`Your reset token is \${token}\`
  });
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};
const sendBudgetExceededEmail = async (to, categoryName, spent, budget) => {
  const info = await transporter.sendMail({
    from: '"FinSight" <noreply@finsight.com>',
    to,
    subject: 'Budget Exceeded',
    text: \`You exceeded budget for \${categoryName}. Spent: \${spent}, Budget: \${budget}\`
  });
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendBudgetExceededEmail };
`);

// 5. services/authService.js
write('services/authService.js', `
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { env } = require('../config/env');

const generateAccessToken = (userId, role) => jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
const generateRefreshToken = (userId) => jwt.sign({ userId }, env.REFRESH_SECRET, { expiresIn: env.REFRESH_EXPIRES_IN });
const verifyAccessToken = (token) => jwt.verify(token, env.JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, env.REFRESH_SECRET);
const hashPassword = (password) => bcrypt.hash(password, 12);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = {
  generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, hashPassword, comparePassword
};
`);

// 6. services/notificationService.js
write('services/notificationService.js', `
const { prisma } = require('../config/prisma');

const createNotification = async (userId, type, title, message) => {
  return await prisma.notification.create({
    data: { userId, type, title, message }
  });
};

module.exports = { createNotification };
`);

// 7. services/analyticsService.js
write('services/analyticsService.js', `
const axios = require('axios');
const { env } = require('../config/env');

const api = axios.create({ baseURL: env.ANALYTICS_URL });

const categorizeTransactions = async (transactions) => (await api.post('/categorize', { transactions })).data;
const getInsights = async (transactions, budgets) => (await api.post('/insights', { transactions, budgets })).data;
const getAnomalies = async (transactions) => (await api.post('/anomalies', { transactions })).data;
const getPredictions = async (monthlyData) => (await api.post('/predictions', { monthlyData })).data;
const generateReport = async (payload) => (await api.post('/report/generate', payload, { responseType: 'arraybuffer' })).data;

module.exports = { categorizeTransactions, getInsights, getAnomalies, getPredictions, generateReport };
`);

// 8. services/uploadService.js
write('services/uploadService.js', `
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');

const parseCSV = (filePath) => {
  const content = fs.readFileSync(filePath);
  return parse(content, { columns: true, skip_empty_lines: true });
};
const parseXLSX = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
};
const normalizeRows = (rows) => {
  return rows.map(r => {
    const norm = {};
    for (const [k, v] of Object.entries(r)) {
      const lower = k.toLowerCase().trim();
      if (lower.includes('merchant') || lower.includes('description') || lower.includes('narration') || lower.includes('details')) {
        norm.merchant = String(v);
      }
      if (lower.includes('amount') || lower.includes('debit') || lower.includes('credit')) {
        norm.amount = Number(v);
      }
      if (lower.includes('date')) {
        norm.date = new Date(v);
      }
    }
    return norm;
  });
};
const validateRows = (rows) => {
  const valid = [];
  const invalid = [];
  for (const r of rows) {
    if (r.date && r.merchant && r.amount !== undefined && !isNaN(r.amount)) valid.push(r);
    else invalid.push(r);
  }
  return { valid, invalid };
};

module.exports = { parseCSV, parseXLSX, normalizeRows, validateRows };
`);

// 9. controllers & routes - Auth
write('controllers/authController.js', `
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
`);

write('routes/auth.js', `
const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const c = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
router.use(authLimiter);

router.post('/signup', validate({ body: z.object({ name: z.string(), email: z.string().email(), password: z.string().min(8) }) }), c.signup);
router.post('/login', validate({ body: z.object({ email: z.string().email(), password: z.string() }) }), c.login);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
router.post('/forgot-password', validate({ body: z.object({ email: z.string().email() }) }), c.forgotPassword);
router.post('/reset-password', validate({ body: z.object({ token: z.string(), password: z.string().min(8) }) }), c.resetPassword);
router.post('/verify-email', validate({ body: z.object({ token: z.string() }) }), c.verifyEmail);

module.exports = router;
`);

// 10. Profile
write('controllers/profileController.js', `
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
`);

write('routes/profile.js', `
const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/profileController');

const router = express.Router();
router.use(authenticate);

router.get('/', c.getProfile);
router.put('/', validate({ body: z.object({ name: z.string().optional(), email: z.string().email().optional() }) }), c.updateProfile);
router.put('/password', validate({ body: z.object({ currentPassword: z.string(), newPassword: z.string().min(8) }) }), c.updatePassword);

module.exports = router;
`);

// 11. Upload
write('controllers/uploadController.js', `
const { prisma } = require('../config/prisma');
const uploadService = require('../services/uploadService');
const analyticsService = require('../services/analyticsService');
const path = require('path');

const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  
  const ext = path.extname(req.file.originalname).toLowerCase();
  let rawRows = [];
  try {
    if (ext === '.csv') rawRows = uploadService.parseCSV(req.file.path);
    else if (ext === '.xlsx') rawRows = uploadService.parseXLSX(req.file.path);
  } catch(e) {
    return res.status(400).json({ success: false, error: 'Failed to parse file' });
  }
  
  const normalized = uploadService.normalizeRows(rawRows);
  const { valid, invalid } = uploadService.validateRows(normalized);
  
  const uf = await prisma.uploadedFile.create({
    data: {
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      status: 'processing'
    }
  });
  
  // Fake analytics categorizer for stability if offline
  let categorized = valid.map(v => ({ ...v, categoryName: 'Uncategorized' }));
  try {
    categorized = await analyticsService.categorizeTransactions(valid);
  } catch(e) { console.error('Analytics failed, using default category'); }
  
  const createdExpenses = [];
  for (const item of categorized) {
    let cat = await prisma.category.findUnique({ where: { name: item.categoryName || 'Uncategorized' } });
    if (!cat) cat = await prisma.category.findUnique({ where: { name: 'Uncategorized' } });
    
    const exp = await prisma.expense.create({
      data: {
        userId: req.user.id,
        categoryId: cat?.id,
        merchant: item.merchant,
        amount: item.amount,
        date: item.date,
        uploadedFileId: uf.id
      }
    });
    createdExpenses.push(exp);
  }
  
  await prisma.uploadedFile.update({ where: { id: uf.id }, data: { status: 'processed', rowCount: createdExpenses.length } });
  
  res.json({ success: true, data: { processed: createdExpenses.length, failed: invalid.length, expenses: createdExpenses } });
};

module.exports = { uploadFile };
`);

write('routes/upload.js', `
const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { upload } = require('../middleware/upload');
const c = require('../controllers/uploadController');

const router = express.Router();
router.use(authenticate);

router.post('/', upload.single('file'), c.uploadFile);

module.exports = router;
`);

// 12. Expenses
write('controllers/expensesController.js', `
const { prisma } = require('../config/prisma');

const getExpenses = async (req, res) => {
  const { categoryId, merchant, dateFrom, dateTo, amountMin, amountMax, paymentMode, page = 1, limit = 20 } = req.query;
  const where = { userId: req.user.id };
  
  if (categoryId) where.categoryId = categoryId;
  if (merchant) where.merchant = { contains: merchant, mode: 'insensitive' };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }
  if (amountMin || amountMax) {
    where.amount = {};
    if (amountMin) where.amount.gte = Number(amountMin);
    if (amountMax) where.amount.lte = Number(amountMax);
  }
  if (paymentMode) where.paymentMode = paymentMode;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);
  
  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({ where, skip, take, include: { category: true }, orderBy: { date: 'desc' } }),
    prisma.expense.count({ where })
  ]);
  
  res.json({ success: true, data: { expenses, total, page: Number(page), pages: Math.ceil(total / take) } });
};

const createExpense = async (req, res) => {
  const { categoryId, merchant, amount, date, description, paymentMode } = req.body;
  const expense = await prisma.expense.create({
    data: { userId: req.user.id, categoryId, merchant, amount, date: new Date(date), description, paymentMode }
  });
  // Budget logic omitted for brevity in stub, but can be added
  res.json({ success: true, data: expense });
};

const updateExpense = async (req, res) => {
  const expense = await prisma.expense.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!expense) return res.status(404).json({ success: false, error: 'Not found' });
  
  const updated = await prisma.expense.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: updated });
};

const deleteExpense = async (req, res) => {
  const expense = await prisma.expense.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!expense) return res.status(404).json({ success: false, error: 'Not found' });
  
  await prisma.expense.delete({ where: { id: req.params.id } });
  res.json({ success: true });
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
`);

write('routes/expenses.js', `
const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/expensesController');

const router = express.Router();
router.use(authenticate);

router.get('/', c.getExpenses);
router.post('/', validate({ body: z.object({ categoryId: z.string().optional(), merchant: z.string(), amount: z.number(), date: z.string(), description: z.string().optional(), paymentMode: z.string().optional() }) }), c.createExpense);
router.put('/:id', c.updateExpense);
router.delete('/:id', c.deleteExpense);

module.exports = router;
`);

// Server stub modifications
let serverJs = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
serverJs = serverJs.replace('const app = express();', 'const app = express();\\napp.get("/health", (req, res) => res.json({status: "ok"}));');
fs.writeFileSync(path.join(__dirname, 'server.js'), serverJs);

console.log('Script completed generating required files');
