const { prisma } = require('../config/prisma');
const analyticsService = require('../services/analyticsService');
const { subMonths, startOfMonth, endOfMonth, format, eachDayOfInterval, subDays } = require('date-fns');

const getSummary = async (req, res) => {
  const userId = req.user.id;

  // Fetch active recurring incomes and active loans
  const [recurringIncomes, activeLoans] = await Promise.all([
    prisma.recurringIncome.findMany({ where: { userId, isActive: true } }),
    prisma.loan.findMany({ where: { userId, status: 'active' } }),
  ]);

  const recurringMonthlyIncome = recurringIncomes.reduce((sum, inc) => {
    let amt = inc.amount;
    if (inc.frequency === 'yearly') amt = inc.amount / 12;
    else if (inc.frequency === 'weekly') amt = inc.amount * 4.33;
    return sum + amt;
  }, 0);

  const monthlyEmiObligation = activeLoans.reduce((sum, l) => sum + l.emiAmount, 0);

  const months = 6;
  const summaries = [];

  for (let i = months - 1; i >= 0; i--) {
    const target = subMonths(new Date(), i);
    const start = startOfMonth(target);
    const end = endOfMonth(target);

    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { amount: true },
    });

    let manualIncome = 0;
    let expense = 0;
    for (const e of expenses) {
      const amt = parseFloat(e.amount);
      if (amt > 0) manualIncome += amt;
      else expense += Math.abs(amt);
    }

    // Total income = manual income transactions + recurring income sources
    const totalIncome = manualIncome > 0 ? manualIncome : recurringMonthlyIncome;
    const netSavings = totalIncome - expense - monthlyEmiObligation;

    summaries.push({
      month: format(target, 'MMM'),
      year: target.getFullYear(),
      monthNum: target.getMonth() + 1,
      income: Math.round(totalIncome * 100) / 100,
      expenses: Math.round(expense * 100) / 100,
      emiObligation: Math.round(monthlyEmiObligation * 100) / 100,
      savings: Math.round(netSavings * 100) / 100,
    });
  }

  // Current month category breakdown
  const now = new Date();
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);

  const currentExpenses = await prisma.expense.findMany({
    where: { userId, date: { gte: currentStart, lte: currentEnd }, amount: { lt: 0 } },
    include: { category: true },
  });

  const categoryMap = {};
  for (const e of currentExpenses) {
    const catName = e.category?.name || 'Uncategorized';
    const color = e.category?.color || '#94a3b8';
    if (!categoryMap[catName]) categoryMap[catName] = { name: catName, color, amount: 0 };
    categoryMap[catName].amount += Math.abs(parseFloat(e.amount));
  }

  const categoryBreakdown = Object.values(categoryMap).map(c => ({
    ...c,
    amount: Math.round(c.amount * 100) / 100,
  }));

  res.json({
    success: true,
    data: {
      monthlySummary: summaries,
      currentMonth: summaries[summaries.length - 1] || { income: 0, expenses: 0, emiObligation: 0, savings: 0 },
      categoryBreakdown,
      recurringMonthlyIncome: Math.round(recurringMonthlyIncome * 100) / 100,
      totalEmiObligation: Math.round(monthlyEmiObligation * 100) / 100,
    },
  });
};

const getTrends = async (req, res) => {
  const userId = req.user.id;
  const end = new Date();
  const start = subDays(end, 29);

  const expenses = await prisma.expense.findMany({
    where: { userId, date: { gte: start, lte: end }, amount: { lt: 0 } },
    select: { amount: true, date: true },
  });

  const days = eachDayOfInterval({ start, end });
  const dailyMap = {};
  for (const day of days) {
    dailyMap[format(day, 'yyyy-MM-dd')] = 0;
  }

  for (const e of expenses) {
    const key = format(new Date(e.date), 'yyyy-MM-dd');
    if (key in dailyMap) {
      dailyMap[key] += Math.abs(parseFloat(e.amount));
    }
  }

  const trend = Object.entries(dailyMap).map(([date, amount]) => ({
    date,
    amount: Math.round(amount * 100) / 100,
  }));

  res.json({ success: true, data: { daily: trend } });
};

const getInsights = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);

  const [currentExpenses, budgets] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: currentStart, lte: currentEnd } },
      include: { category: true },
    }),
    prisma.budget.findMany({
      where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
      include: { category: true },
    }),
  ]);

  const txPayload = currentExpenses.map(e => ({
    id: e.id,
    merchant: e.merchant,
    amount: parseFloat(e.amount),
    date: e.date.toISOString().split('T')[0],
    category: e.category?.name || 'Uncategorized',
    description: e.description,
  }));

  const budgetPayload = budgets.map(b => ({
    category: b.category.name,
    amount: parseFloat(b.amount),
  }));

  try {
    const insights = await analyticsService.getInsights(txPayload, budgetPayload);
    res.json({ success: true, data: insights });
  } catch (err) {
    console.error('Insights service error:', err.message);
    res.json({ success: true, data: { insights: [] } });
  }
};

const getPredictions = async (req, res) => {
  const userId = req.user.id;
  const months = 6;
  const monthlyData = [];

  for (let i = months - 1; i >= 0; i--) {
    const target = subMonths(new Date(), i);
    const start = startOfMonth(target);
    const end = endOfMonth(target);

    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { amount: true },
    });

    let income = 0;
    let expTotal = 0;
    for (const e of expenses) {
      const amt = parseFloat(e.amount);
      if (amt > 0) income += amt;
      else expTotal += Math.abs(amt);
    }

    monthlyData.push({
      month: target.getMonth() + 1,
      year: target.getFullYear(),
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expTotal * 100) / 100,
      savings: Math.round((income - expTotal) * 100) / 100,
    });
  }

  try {
    const predictions = await analyticsService.getPredictions(monthlyData);
    res.json({ success: true, data: { ...predictions, monthlyData } });
  } catch (err) {
    console.error('Predictions service error:', err.message);
    res.json({ success: true, data: { next_month: { predicted_savings: 0, predicted_income: 0, predicted_expenses: 0 }, confidence: 0, trend: 'stable', monthlyData } });
  }
};

const getAnomalies = async (req, res) => {
  const userId = req.user.id;

  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 200,
    include: { category: true },
  });

  const txPayload = expenses.map(e => ({
    id: e.id,
    merchant: e.merchant,
    amount: parseFloat(e.amount),
    date: e.date.toISOString().split('T')[0],
    category: e.category?.name || 'Uncategorized',
    description: e.description,
  }));

  try {
    const result = await analyticsService.getAnomalies(txPayload);
    const anomalyIds = (result.anomalies || []).map(a => a.id);

    // Mark anomalous in DB
    if (anomalyIds.length > 0) {
      await prisma.expense.updateMany({
        where: { id: { in: anomalyIds } },
        data: { isAnomalous: true },
      });
      // Unmark the ones that are no longer anomalous
      await prisma.expense.updateMany({
        where: { userId, id: { notIn: anomalyIds }, isAnomalous: true },
        data: { isAnomalous: false },
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Anomalies service error:', err.message);
    res.json({ success: true, data: { anomalies: [] } });
  }
};

module.exports = { getSummary, getTrends, getInsights, getPredictions, getAnomalies };
