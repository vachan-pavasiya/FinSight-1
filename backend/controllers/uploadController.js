const { prisma } = require('../config/prisma');
const uploadService = require('../services/uploadService');
const analyticsService = require('../services/analyticsService');
const path = require('path');

const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  
  const ext = path.extname(req.file.originalname).toLowerCase();
  let rawRows = [];
  try {
    if (ext === '.csv') rawRows = uploadService.parseCSV(req.file.path);
    else if (ext === '.xlsx') rawRows = uploadService.parseXLSX(req.file.path);
  } catch(e) {
    return res.status(400).json({ success: false, error: 'Failed to parse file' });
  }
  
  const normalized = uploadService.normalizeRows(rawRows);
  const { valid, invalid } = uploadService.validateRows(normalized);
  
  const uf = await prisma.uploadedFile.create({
    data: {
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      status: 'processing'
    }
  });
  
  // Fake analytics categorizer for stability if offline
  let categorized = valid.map(v => ({ ...v, categoryName: 'Uncategorized' }));
  try {
    categorized = await analyticsService.categorizeTransactions(valid);
  } catch(e) { console.error('Analytics failed, using default category'); }
  
  const createdExpenses = [];
  for (const item of categorized) {
    let cat = await prisma.category.findUnique({ where: { name: item.categoryName || 'Uncategorized' } });
    if (!cat) cat = await prisma.category.findUnique({ where: { name: 'Uncategorized' } });
    
    const exp = await prisma.expense.create({
      data: {
        userId: req.user.id,
        categoryId: cat?.id,
        merchant: item.merchant,
        amount: item.amount,
        date: item.date,
        uploadedFileId: uf.id
      }
    });
    createdExpenses.push(exp);
  }
  
  await prisma.uploadedFile.update({ where: { id: uf.id }, data: { status: 'processed', rowCount: createdExpenses.length } });
  
  res.json({ success: true, data: { processed: createdExpenses.length, failed: invalid.length, expenses: createdExpenses } });
};

module.exports = { uploadFile };
