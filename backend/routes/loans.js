const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/loanController');

const router = express.Router();
router.use(authenticate);

router.get('/', c.getLoans);

router.post(
  '/',
  validate({
    body: z.object({
      title: z.string().min(1, 'Title is required'),
      loanType: z.enum(['home', 'car', 'mobile', 'personal', 'education', 'electronics']).default('home'),
      principalAmount: z.coerce.number().positive('Principal amount must be positive'),
      emiAmount: z.coerce.number().positive('EMI amount must be positive'),
      interestRate: z.coerce.number().min(0).default(0),
      tenureMonths: z.coerce.number().int().positive('Tenure months must be > 0'),
      emisPaid: z.coerce.number().int().min(0).default(0),
      dueDate: z.coerce.number().min(1).max(31).default(10),
      startDate: z.string().optional(),
    }),
  }),
  c.createLoan
);

router.put(
  '/:id',
  validate({
    body: z.object({
      title: z.string().optional(),
      loanType: z.enum(['home', 'car', 'mobile', 'personal', 'education', 'electronics']).optional(),
      principalAmount: z.coerce.number().positive().optional(),
      emiAmount: z.coerce.number().positive().optional(),
      interestRate: z.coerce.number().min(0).optional(),
      tenureMonths: z.coerce.number().int().positive().optional(),
      emisPaid: z.coerce.number().int().min(0).optional(),
      dueDate: z.coerce.number().min(1).max(31).optional(),
      status: z.enum(['active', 'closed']).optional(),
    }),
  }),
  c.updateLoan
);

router.post('/:id/pay-emi', c.payEmi);
router.delete('/:id', c.deleteLoan);

module.exports = router;
