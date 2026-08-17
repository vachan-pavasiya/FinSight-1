const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/reportController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getReport);
router.get('/list', c.getList);
module.exports = router;
