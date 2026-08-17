const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/categoriesController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getCategories);
module.exports = router;
