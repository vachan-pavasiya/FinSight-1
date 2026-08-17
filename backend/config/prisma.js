const { PrismaClient } = require('@prisma/client');
const { env } = require('./env');

const prismaGlobal = global.prisma || new PrismaClient();
if (env.NODE_ENV !== 'production') {
  global.prisma = prismaGlobal;
}
module.exports = { prisma: prismaGlobal };
