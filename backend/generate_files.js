const fs = require('fs');
const path = require('path');

const writeFileSync = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
};

const authService = `
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { env } = require("../config/env");
const { prisma } = require("../config/prisma");

const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId }, env.REFRESH_SECRET, { expiresIn: env.REFRESH_EXPIRES_IN });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
`;
writeFileSync('services/authService.js', authService);

const expenseService = `
const { prisma } = require("../config/prisma");

const createExpense = async (data) => {
  return await prisma.expense.create({ data });
};

module.exports = { createExpense };
`;
writeFileSync('services/expenseService.js', expenseService);

const routesAuth = `
const express = require("express");
const router = express.Router();
router.post("/signup", (req, res) => res.json({ success: true }));
module.exports = router;
`;
writeFileSync('routes/auth.js', routesAuth);

console.log("Services and routes generated (stubbed)");
