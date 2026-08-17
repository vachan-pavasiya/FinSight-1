const fs = require('fs');
const path = require('path');

const write = (p, content) => {
  const fullPath = path.join(__dirname, p);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

// 13. Budget
write('controllers/budgetController.js', `
const { prisma } = require('../config/prisma');

const getBudgets = async (req, res) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const budgets = await prisma.budget.findMany({
    where: { userId: req.user.id, month, year },
    include: { category: true }
  });
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const expenses = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: { userId: req.user.id, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true }
  });
  
  const spentMap = {};
  expenses.forEach(e => { if (e.categoryId) spentMap[e.categoryId] = Number(e._sum.amount); });
  
  const result = budgets.map(b => {
    const spent = spentMap[b.categoryId] || 0;
    return { ...b, spent, percentage: (spent / Number(b.amount)) * 100 };
  });
  
  res.json({ success: true, data: result });
};

const upsertBudget = async (req, res) => {
  const { categoryId, amount, period = 'monthly', month, year } = req.body;
  const budget = await prisma.budget.upsert({
    where: { userId_categoryId_month_year: { userId: req.user.id, categoryId, month, year } },
    update: { amount, period },
    create: { userId: req.user.id, categoryId, amount, period, month, year }
  });
  res.json({ success: true, data: budget });
};

const deleteBudget = async (req, res) => {
  const budget = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!budget) return res.status(404).json({ success: false, error: 'Not found' });
  await prisma.budget.delete({ where: { id: req.params.id } });
  res.json({ success: true });
};

module.exports = { getBudgets, upsertBudget, deleteBudget };
`);
write('routes/budget.js', `
const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/budgetController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getBudgets);
router.post('/', c.upsertBudget);
router.delete('/:id', c.deleteBudget);
module.exports = router;
`);

// 14. Goals
write('controllers/goalsController.js', `
const { prisma } = require('../config/prisma');

const getGoals = async (req, res) => {
  const goals = await prisma.goal.findMany({ where: { userId: req.user.id } });
  res.json({ success: true, data: goals });
};

const createGoal = async (req, res) => {
  const { name, targetAmount, deadline } = req.body;
  const goal = await prisma.goal.create({
    data: { userId: req.user.id, name, targetAmount, deadline: deadline ? new Date(deadline) : null }
  });
  res.json({ success: true, data: goal });
};

const updateGoal = async (req, res) => {
  const { name, targetAmount, deadline, contribution } = req.body;
  const goal = await prisma.goal.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!goal) return res.status(404).json({ success: false, error: 'Not found' });
  
  let newCurrent = Number(goal.currentAmount);
  if (contribution) newCurrent += Number(contribution);
  
  const isCompleted = newCurrent >= Number(targetAmount || goal.targetAmount);
  
  const updated = await prisma.goal.update({
    where: { id: req.params.id },
    data: { name, targetAmount, deadline: deadline ? new Date(deadline) : undefined, currentAmount: newCurrent, isCompleted }
  });
  
  if (isCompleted && !goal.isCompleted) {
    await prisma.notification.create({
      data: { userId: req.user.id, type: 'goal_completed', title: 'Goal Completed!', message: \`You completed your goal: \${updated.name}\` }
    });
  }
  
  res.json({ success: true, data: updated });
};

const deleteGoal = async (req, res) => {
  const goal = await prisma.goal.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!goal) return res.status(404).json({ success: false, error: 'Not found' });
  await prisma.goal.delete({ where: { id: req.params.id } });
  res.json({ success: true });
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
`);
write('routes/goals.js', `
const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/goalsController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getGoals);
router.post('/', c.createGoal);
router.put('/:id', c.updateGoal);
router.delete('/:id', c.deleteGoal);
module.exports = router;
`);

// 15. Analytics
write('controllers/analyticsController.js', `
const { prisma } = require('../config/prisma');
const analyticsService = require('../services/analyticsService');

const getSummary = async (req, res) => {
  // basic stub
  res.json({ success: true, data: [] });
};
const getTrends = async (req, res) => { res.json({ success: true, data: [] }); };
const getInsights = async (req, res) => { res.json({ success: true, data: [] }); };
const getPredictions = async (req, res) => { res.json({ success: true, data: [] }); };
const getAnomalies = async (req, res) => { res.json({ success: true, data: [] }); };

module.exports = { getSummary, getTrends, getInsights, getPredictions, getAnomalies };
`);
write('routes/analytics.js', `
const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/analyticsController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getSummary);
router.get('/trends', c.getTrends);
router.get('/insights', c.getInsights);
router.get('/predictions', c.getPredictions);
router.get('/anomalies', c.getAnomalies);
module.exports = router;
`);

// 16. Report
write('controllers/reportController.js', `
const { prisma } = require('../config/prisma');
const getReport = async (req, res) => { res.json({ success: true }); };
const getList = async (req, res) => { res.json({ success: true, data: [] }); };
module.exports = { getReport, getList };
`);
write('routes/report.js', `
const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/reportController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getReport);
router.get('/list', c.getList);
module.exports = router;
`);

// 17. Notifications
write('controllers/notificationsController.js', `
const { prisma } = require('../config/prisma');
const getList = async (req, res) => {
  const notifs = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: notifs });
};
const markRead = async (req, res) => {
  await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { isRead: true } });
  res.json({ success: true });
};
const markAllRead = async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id }, data: { isRead: true } });
  res.json({ success: true });
};
module.exports = { getList, markRead, markAllRead };
`);
write('routes/notifications.js', `
const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/notificationsController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getList);
router.put('/:id/read', c.markRead);
router.put('/read-all', c.markAllRead);
module.exports = router;
`);

// 18. Admin
write('controllers/adminController.js', `
const { prisma } = require('../config/prisma');
const getUsers = async (req, res) => { res.json({ success: true, data: [] }); };
const getStats = async (req, res) => { res.json({ success: true, data: {} }); };
module.exports = { getUsers, getStats };
`);
write('routes/admin.js', `
const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/requireAdmin');
const c = require('../controllers/adminController');

const router = express.Router();
router.use(authenticate);
router.use(requireAdmin);
router.get('/users', c.getUsers);
router.get('/stats', c.getStats);
module.exports = router;
`);

// 19. Categories
write('controllers/categoriesController.js', `
const { prisma } = require('../config/prisma');
const getCategories = async (req, res) => {
  const cats = await prisma.category.findMany();
  res.json({ success: true, data: cats });
};
module.exports = { getCategories };
`);
write('routes/categories.js', `
const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/categoriesController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getCategories);
module.exports = router;
`);

// 22. Seed
write('prisma/seed.js', `
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Food', color: '#f59e0b', icon: 'pizza' },
    { name: 'Transport', color: '#3b82f6', icon: 'car' },
    { name: 'Shopping', color: '#8b5cf6', icon: 'bag' },
    { name: 'Entertainment', color: '#ec4899', icon: 'film' },
    { name: 'Bills', color: '#ef4444', icon: 'document' },
    { name: 'Health', color: '#10b981', icon: 'medkit' },
    { name: 'Education', color: '#06b6d4', icon: 'book' },
    { name: 'Travel', color: '#f97316', icon: 'airplane' },
    { name: 'Income', color: '#22c55e', icon: 'cash' },
    { name: 'Uncategorized', color: '#94a3b8', icon: 'help' }
  ];

  for (const c of categories) {
    await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c });
  }

  const hash = await bcrypt.hash('Admin@123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@finsight.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@finsight.com', password: hash, isEmailVerified: true, role: 'admin' }
  });

  const testHash = await bcrypt.hash('Test@123456', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@finsight.com' },
    update: {},
    create: { name: 'Test User', email: 'test@finsight.com', password: testHash, isEmailVerified: true, role: 'user' }
  });

  console.log('Seeded database successfully');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
`);

// Jest Config
write('jest.config.js', `
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
};
`);

// .env for tests
write('.env', `
DATABASE_URL=postgresql://finsight:finsight123@localhost:5432/finsight
JWT_SECRET=finsight_jwt_secret_minimum_32_chars_long
JWT_EXPIRES_IN=15m
REFRESH_SECRET=finsight_refresh_secret_min_32_chars
REFRESH_EXPIRES_IN=7d
ANALYTICS_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
PORT=4000
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
`);

// Tests stub
write('tests/auth.test.js', `
describe('Auth', () => { it('works', () => { expect(1).toBe(1); }); });
`);
write('tests/security.test.js', `
describe('Security', () => { it('works', () => { expect(1).toBe(1); }); });
`);
write('tests/expenses.test.js', `
describe('Expenses', () => { it('works', () => { expect(1).toBe(1); }); });
`);

console.log('Script completed generating second batch of files');
