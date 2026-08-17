const { prisma } = require('../config/prisma');

// GET /loans
const getLoans = async (req, res) => {
  const userId = req.user.id;
  const loans = await prisma.loan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const activeLoans = loans.filter(l => l.status === 'active');
  const totalEmiObligation = activeLoans.reduce((sum, l) => sum + l.emiAmount, 0);
  const totalPrincipalRemaining = activeLoans.reduce((sum, l) => {
    const remainingEmis = Math.max(0, l.tenureMonths - l.emisPaid);
    return sum + (remainingEmis * l.emiAmount);
  }, 0);

  const formattedLoans = loans.map(loan => {
    const progressPct = Math.min(100, Math.round((loan.emisPaid / loan.tenureMonths) * 100));
    const remainingEmis = Math.max(0, loan.tenureMonths - loan.emisPaid);
    const remainingAmount = remainingEmis * loan.emiAmount;
    return {
      ...loan,
      progressPct,
      remainingEmis,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
    };
  });

  res.json({
    success: true,
    data: {
      loans: formattedLoans,
      summary: {
        totalActiveLoans: activeLoans.length,
        totalEmiObligation: Math.round(totalEmiObligation * 100) / 100,
        totalPrincipalRemaining: Math.round(totalPrincipalRemaining * 100) / 100,
      },
    },
  });
};

// POST /loans
const createLoan = async (req, res) => {
  const userId = req.user.id;
  const { title, loanType, principalAmount, emiAmount, interestRate, tenureMonths, emisPaid, dueDate, startDate } = req.body;

  const loan = await prisma.loan.create({
    data: {
      userId,
      title,
      loanType: loanType || 'home',
      principalAmount: parseFloat(principalAmount),
      emiAmount: parseFloat(emiAmount),
      interestRate: interestRate !== undefined ? parseFloat(interestRate) : 0,
      tenureMonths: parseInt(tenureMonths),
      emisPaid: emisPaid !== undefined ? parseInt(emisPaid) : 0,
      dueDate: dueDate !== undefined ? parseInt(dueDate) : 10,
      startDate: startDate ? new Date(startDate) : new Date(),
    },
  });

  res.json({ success: true, data: loan });
};

// PUT /loans/:id
const updateLoan = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, loanType, principalAmount, emiAmount, interestRate, tenureMonths, emisPaid, dueDate, status } = req.body;

  const existing = await prisma.loan.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ success: false, error: 'Loan entry not found' });

  const updatedEmisPaid = emisPaid !== undefined ? parseInt(emisPaid) : existing.emisPaid;
  const isClosed = updatedEmisPaid >= (tenureMonths || existing.tenureMonths);

  const updated = await prisma.loan.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(loanType && { loanType }),
      ...(principalAmount !== undefined && { principalAmount: parseFloat(principalAmount) }),
      ...(emiAmount !== undefined && { emiAmount: parseFloat(emiAmount) }),
      ...(interestRate !== undefined && { interestRate: parseFloat(interestRate) }),
      ...(tenureMonths !== undefined && { tenureMonths: parseInt(tenureMonths) }),
      emisPaid: updatedEmisPaid,
      ...(dueDate !== undefined && { dueDate: parseInt(dueDate) }),
      status: status || (isClosed ? 'closed' : existing.status),
    },
  });

  res.json({ success: true, data: updated });
};

// POST /loans/:id/pay-emi (Increment EMIs paid by 1)
const payEmi = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existing = await prisma.loan.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ success: false, error: 'Loan entry not found' });

  if (existing.emisPaid >= existing.tenureMonths) {
    return res.status(400).json({ success: false, error: 'Loan EMI tenure is already fully paid' });
  }

  const newEmisPaid = existing.emisPaid + 1;
  const isCompleted = newEmisPaid >= existing.tenureMonths;

  const updated = await prisma.loan.update({
    where: { id },
    data: {
      emisPaid: newEmisPaid,
      status: isCompleted ? 'closed' : existing.status,
    },
  });

  res.json({
    success: true,
    data: updated,
    message: isCompleted ? 'Loan fully paid off!' : `EMI paid successfully (${newEmisPaid}/${existing.tenureMonths})`,
  });
};

// DELETE /loans/:id
const deleteLoan = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existing = await prisma.loan.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ success: false, error: 'Loan entry not found' });

  await prisma.loan.delete({ where: { id } });
  res.json({ success: true, message: 'Loan entry deleted successfully' });
};

module.exports = { getLoans, createLoan, updateLoan, payEmi, deleteLoan };
