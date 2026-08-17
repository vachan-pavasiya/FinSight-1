const { prisma } = require('../config/prisma');

// GET /income
const getIncomes = async (req, res) => {
  const userId = req.user.id;
  const incomes = await prisma.recurringIncome.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const totalMonthlyIncome = incomes
    .filter(inc => inc.isActive)
    .reduce((sum, inc) => {
      let monthlyVal = inc.amount;
      if (inc.frequency === 'yearly') monthlyVal = inc.amount / 12;
      else if (inc.frequency === 'weekly') monthlyVal = inc.amount * 4.33;
      return sum + monthlyVal;
    }, 0);

  res.json({
    success: true,
    data: {
      incomes,
      totalMonthlyIncome: Math.round(totalMonthlyIncome * 100) / 100,
    },
  });
};

// POST /income
const createIncome = async (req, res) => {
  const userId = req.user.id;
  const { source, amount, frequency, payoutDay, description } = req.body;

  const income = await prisma.recurringIncome.create({
    data: {
      userId,
      source,
      amount: parseFloat(amount),
      frequency: frequency || 'monthly',
      payoutDay: parseInt(payoutDay) || 1,
      description,
    },
  });

  res.json({ success: true, data: income });
};

// PUT /income/:id
const updateIncome = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { source, amount, frequency, payoutDay, isActive, description } = req.body;

  const existing = await prisma.recurringIncome.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ success: false, error: 'Income source not found' });

  const updated = await prisma.recurringIncome.update({
    where: { id },
    data: {
      ...(source && { source }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(frequency && { frequency }),
      ...(payoutDay !== undefined && { payoutDay: parseInt(payoutDay) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(description !== undefined && { description }),
    },
  });

  res.json({ success: true, data: updated });
};

// DELETE /income/:id
const deleteIncome = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existing = await prisma.recurringIncome.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ success: false, error: 'Income source not found' });

  await prisma.recurringIncome.delete({ where: { id } });
  res.json({ success: true, message: 'Income source deleted successfully' });
};

module.exports = { getIncomes, createIncome, updateIncome, deleteIncome };
