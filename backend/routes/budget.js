const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/budgetController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getBudgets);
router.post('/', c.upsertBudget);
router.delete('/:id', c.deleteBudget);
module.exports = router;
