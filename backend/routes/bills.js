const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/billController');

const router = express.Router();
router.use(authenticate);

router.get('/', c.getBills);

router.post(
  '/',
  validate({
    body: z.object({
      title: z.string().min(1, 'Title is required'),
      categoryType: z.enum(['mobile', 'broadband', 'ott', 'electricity', 'water', 'gas', 'utility']).default('broadband'),
      provider: z.string().optional(),
      amount: z.coerce.number().positive('Amount must be positive'),
      isAutoRecurring: z.boolean().default(true),
      frequency: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly'),
      dueDay: z.coerce.number().min(1).max(31).default(5),
      paymentMode: z.string().default('upi'),
      notes: z.string().optional(),
    }),
  }),
  c.createBill
);

router.put(
  '/:id',
  validate({
    body: z.object({
      title: z.string().optional(),
      categoryType: z.enum(['mobile', 'broadband', 'ott', 'electricity', 'water', 'gas', 'utility']).optional(),
      provider: z.string().optional(),
      amount: z.coerce.number().positive().optional(),
      isAutoRecurring: z.boolean().optional(),
      frequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
      dueDay: z.coerce.number().min(1).max(31).optional(),
      paymentMode: z.string().optional(),
      status: z.enum(['active', 'paused']).optional(),
      notes: z.string().optional(),
    }),
  }),
  c.updateBill
);

router.delete('/:id', c.deleteBill);

module.exports = router;
