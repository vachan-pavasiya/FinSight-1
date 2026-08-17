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
