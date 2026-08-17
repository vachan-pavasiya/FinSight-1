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
