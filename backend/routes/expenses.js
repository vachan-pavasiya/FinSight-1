const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/expensesController');

const router = express.Router();
router.use(authenticate);

router.get('/', c.getExpenses);
router.post('/', validate({ body: z.object({ categoryId: z.string().optional(), merchant: z.string(), amount: z.number(), date: z.string(), description: z.string().optional(), paymentMode: z.string().optional() }) }), c.createExpense);
router.put('/:id', c.updateExpense);
router.delete('/:id', c.deleteExpense);

module.exports = router;
