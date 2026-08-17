const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const c = require('../controllers/analyticsController');

const router = express.Router();
router.use(authenticate);
router.get('/', c.getSummary);
router.get('/trends', c.getTrends);
router.get('/insights', c.getInsights);
router.get('/predictions', c.getPredictions);
router.get('/anomalies', c.getAnomalies);
module.exports = router;
