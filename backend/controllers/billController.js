const { prisma } = require('../config/prisma');

// GET /bills
const getBills = async (req, res) => {
  const userId = req.user.id;
  const bills = await prisma.billSubscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const activeBills = bills.filter(b => b.status === 'active');
  const totalMonthlyBills = activeBills.reduce((sum, b) => {
    let amt = b.amount;
    if (b.frequency === 'yearly') amt = b.amount / 12;
    else if (b.frequency === 'quarterly') amt = b.amount / 3;
    return sum + amt;
  }, 0);

  const breakdownByCategory = activeBills.reduce((acc, b) => {
    const type = b.categoryType || 'utility';
    acc[type] = (acc[type] || 0) + b.amount;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      bills,
      summary: {
        totalActiveBills: activeBills.length,
        totalMonthlyBills: Math.round(totalMonthlyBills * 100) / 100,
        breakdownByCategory,
      },
    },
  });
};

// POST /bills
const createBill = async (req, res) => {
  const userId = req.user.id;
  const { title, categoryType, provider, amount, isAutoRecurring, frequency, dueDay, paymentMode, notes } = req.body;

  const bill = await prisma.billSubscription.create({
    data: {
      userId,
      title,
      categoryType: categoryType || 'broadband',
      provider,
      amount: parseFloat(amount),
      isAutoRecurring: isAutoRecurring !== undefined ? Boolean(isAutoRecurring) : true,
      frequency: frequency || 'monthly',
      dueDay: dueDay !== undefined ? parseInt(dueDay) : 5,
      paymentMode: paymentMode || 'upi',
      notes,
    },
  });

  res.json({ success: true, data: bill });
};

// PUT /bills/:id
const updateBill = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, categoryType, provider, amount, isAutoRecurring, frequency, dueDay, paymentMode, status, notes } = req.body;

  const existing = await prisma.billSubscription.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ success: false, error: 'Bill entry not found' });

  const updated = await prisma.billSubscription.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(categoryType && { categoryType }),
      ...(provider !== undefined && { provider }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(isAutoRecurring !== undefined && { isAutoRecurring: Boolean(isAutoRecurring) }),
      ...(frequency && { frequency }),
      ...(dueDay !== undefined && { dueDay: parseInt(dueDay) }),
      ...(paymentMode && { paymentMode }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    },
  });

  res.json({ success: true, data: updated });
};

// DELETE /bills/:id
const deleteBill = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existing = await prisma.billSubscription.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ success: false, error: 'Bill entry not found' });

  await prisma.billSubscription.delete({ where: { id } });
  res.json({ success: true, message: 'Bill entry deleted successfully' });
};

module.exports = { getBills, createBill, updateBill, deleteBill };
