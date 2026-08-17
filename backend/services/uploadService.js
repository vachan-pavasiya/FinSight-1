const fs = require('fs');
const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');

const parseCSV = (filePath) => {
  const content = fs.readFileSync(filePath);
  return parse(content, { columns: true, skip_empty_lines: true });
};
const parseXLSX = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
};
const normalizeRows = (rows) => {
  return rows.map(r => {
    const norm = {};
    for (const [k, v] of Object.entries(r)) {
      const lower = k.toLowerCase().trim();
      if (lower.includes('merchant') || lower.includes('description') || lower.includes('narration') || lower.includes('details')) {
        norm.merchant = String(v);
      }
      if (lower.includes('amount') || lower.includes('debit') || lower.includes('credit')) {
        norm.amount = Number(v);
      }
      if (lower.includes('date')) {
        norm.date = new Date(v);
      }
    }
    return norm;
  });
};
const validateRows = (rows) => {
  const valid = [];
  const invalid = [];
  for (const r of rows) {
    if (r.date && r.merchant && r.amount !== undefined && !isNaN(r.amount)) valid.push(r);
    else invalid.push(r);
  }
  return { valid, invalid };
};

module.exports = { parseCSV, parseXLSX, normalizeRows, validateRows };
