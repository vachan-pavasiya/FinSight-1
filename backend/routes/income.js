const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/incomeController');

const router = express.Router();
router.use(authenticate);

router.get('/', c.getIncomes);

router.post(
  '/',
  validate({
    body: z.object({
      source: z.string().min(1, 'Source name is required'),
      amount: z.coerce.number().positive('Amount must be positive'),
      frequency: z.enum(['monthly', 'yearly', 'weekly']).default('monthly'),
      payoutDay: z.coerce.number().min(1).max(31).default(1),
      description: z.string().optional(),
    }),
  }),
  c.createIncome
);

router.put(
  '/:id',
  validate({
    body: z.object({
      source: z.string().optional(),
      amount: z.coerce.number().positive().optional(),
      frequency: z.enum(['monthly', 'yearly', 'weekly']).optional(),
      payoutDay: z.coerce.number().min(1).max(31).optional(),
      isActive: z.boolean().optional(),
      description: z.string().optional(),
    }),
  }),
  c.updateIncome
);

router.delete('/:id', c.deleteIncome);

module.exports = router;
