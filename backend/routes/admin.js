const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/requireAdmin');
const c = require('../controllers/adminController');

const router = express.Router();
router.use(authenticate);
router.use(requireAdmin);
router.get('/users', c.getUsers);
router.get('/stats', c.getStats);
module.exports = router;
