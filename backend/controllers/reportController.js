const { prisma } = require('../config/prisma');
const analyticsService = require('../services/analyticsService');
const path = require('path');
const fs = require('fs');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

const getReport = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : startOfMonth(new Date());
  const end = endDate ? new Date(endDate) : endOfMonth(new Date());

  // Fetch all required data
  const [expenses, budgets, goals, user] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: 'desc' },
    }),
    prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
  ]);

  const txPayload = expenses.map(e => ({
    id: e.id,
    merchant: e.merchant,
    amount: parseFloat(e.amount),
    date: format(new Date(e.date), 'yyyy-MM-dd'),
    category: e.category?.name || 'Uncategorized',
    description: e.description || '',
  }));

  const budgetPayload = budgets.map(b => ({
    category: b.category.name,
    amount: parseFloat(b.amount),
  }));

  const goalPayload = goals.map(g => ({
    name: g.name,
    target: parseFloat(g.targetAmount),
    current: parseFloat(g.currentAmount),
  }));

  // Get insights and anomalies
  let insights = [];
  let anomalies = [];
  try {
    const [insightsResult, anomaliesResult] = await Promise.all([
      analyticsService.getInsights(txPayload, budgetPayload),
      analyticsService.getAnomalies(txPayload),
    ]);
    insights = insightsResult?.insights || [];
    anomalies = anomaliesResult?.anomalies || [];
  } catch (err) {
    console.error('Analytics service error during report generation:', err.message);
  }

  // Generate PDF
  const pdfPayload = {
    user: { name: user.name, email: user.email },
    transactions: txPayload,
    budgets: budgetPayload,
    goals: goalPayload,
    insights,
    anomalies,
    period: {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    },
  };

  let pdfBuffer;
  try {
    pdfBuffer = await analyticsService.generateReport(pdfPayload);
  } catch (err) {
    return res.status(503).json({ success: false, error: 'Report generation service unavailable' });
  }

  // Save to disk
  const reportsDir = path.join(process.env.UPLOAD_DIR || './uploads', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const filename = `report_${userId}_${Date.now()}.pdf`;
  const filepath = path.join(reportsDir, filename);
  fs.writeFileSync(filepath, pdfBuffer);

  const stats = fs.statSync(filepath);

  // Save record
  await prisma.report.create({
    data: {
      userId,
      filename,
      period: `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`,
      startDate: start,
      endDate: end,
      size: stats.size,
    },
  });

  // Send PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', stats.size);
  res.send(Buffer.from(pdfBuffer));
};

const getList = async (req, res) => {
  const reports = await prisma.report.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: reports });
};

module.exports = { getReport, getList };
