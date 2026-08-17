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
      data: { userId: req.user.id, type: 'goal_completed', title: 'Goal Completed!', message: `You completed your goal: ${updated.name}` }
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
