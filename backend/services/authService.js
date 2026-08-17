const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { env } = require('../config/env');

const generateAccessToken = (userId, role) => jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
const generateRefreshToken = (userId) => jwt.sign({ userId }, env.REFRESH_SECRET, { expiresIn: env.REFRESH_EXPIRES_IN });
const verifyAccessToken = (token) => jwt.verify(token, env.JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, env.REFRESH_SECRET);
const hashPassword = (password) => bcrypt.hash(password, 12);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = {
  generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, hashPassword, comparePassword
};
