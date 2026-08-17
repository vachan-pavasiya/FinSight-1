const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/profileController');

const router = express.Router();
router.use(authenticate);

router.get('/', c.getProfile);
router.put('/', validate({ body: z.object({ name: z.string().optional(), email: z.string().email().optional() }) }), c.updateProfile);
router.put('/password', validate({ body: z.object({ currentPassword: z.string(), newPassword: z.string().min(8) }) }), c.updatePassword);

module.exports = router;
