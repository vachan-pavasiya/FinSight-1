const { prisma } = require('../config/prisma');

const createNotification = async (userId, type, title, message) => {
  return await prisma.notification.create({
    data: { userId, type, title, message }
  });
};

module.exports = { createNotification };
