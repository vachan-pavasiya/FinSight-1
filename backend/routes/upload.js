const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { upload } = require('../middleware/upload');
const c = require('../controllers/uploadController');

const router = express.Router();
router.use(authenticate);

router.post('/', upload.single('file'), c.uploadFile);

module.exports = router;
