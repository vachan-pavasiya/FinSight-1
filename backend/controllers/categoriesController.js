const { prisma } = require('../config/prisma');
const getCategories = async (req, res) => {
  const cats = await prisma.category.findMany();
  res.json({ success: true, data: cats });
};
module.exports = { getCategories };
