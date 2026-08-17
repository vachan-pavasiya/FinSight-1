const { prisma } = require('../config/prisma');

const getExpenses = async (req, res) => {
  const { categoryId, merchant, dateFrom, dateTo, amountMin, amountMax, paymentMode, page = 1, limit = 20 } = req.query;
  const where = { userId: req.user.id };
  
  if (categoryId) where.categoryId = categoryId;
  if (merchant) where.merchant = { contains: merchant };
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
    data: {
      userId: req.user.id,
      categoryId,
      merchant,
      amount: parseFloat(amount),
      date: new Date(date),
      description,
      paymentMode: paymentMode || 'card'
    },
    include: { category: true }
  });
  res.json({ success: true, data: expense });
};

const updateExpense = async (req, res) => {
  const expense = await prisma.expense.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
  
  const { categoryId, merchant, amount, date, description, paymentMode } = req.body;
  const data = {};
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (merchant !== undefined) data.merchant = merchant;
  if (amount !== undefined) data.amount = parseFloat(amount);
  if (date !== undefined) data.date = new Date(date);
  if (description !== undefined) data.description = description;
  if (paymentMode !== undefined) data.paymentMode = paymentMode;

  const updated = await prisma.expense.update({
    where: { id: req.params.id },
    data,
    include: { category: true }
  });
  res.json({ success: true, data: updated });
};

const deleteExpense = async (req, res) => {
  const expense = await prisma.expense.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
  
  await prisma.expense.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Expense deleted successfully' });
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
