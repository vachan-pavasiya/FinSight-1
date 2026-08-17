const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/goalsController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getGoals);
router.post('/', c.createGoal);
router.put('/:id', c.updateGoal);
router.delete('/:id', c.deleteGoal);
module.exports = router;
