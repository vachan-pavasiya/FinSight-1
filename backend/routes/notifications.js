const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/notificationsController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getList);
router.put('/:id/read', c.markRead);
router.put('/read-all', c.markAllRead);
module.exports = router;
