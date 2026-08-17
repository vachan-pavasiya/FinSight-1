const { prisma } = require('../config/prisma');
const getUsers = async (req, res) => { res.json({ success: true, data: [] }); };
const getStats = async (req, res) => { res.json({ success: true, data: {} }); };
module.exports = { getUsers, getStats };
