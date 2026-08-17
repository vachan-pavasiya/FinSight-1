const { prisma } = require("../config/prisma");

const createExpense = async (data) => {
  return await prisma.expense.create({ data });
};

module.exports = { createExpense };
