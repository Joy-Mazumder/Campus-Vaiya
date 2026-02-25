const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { generateLabReport, generateRoadmap } = require('../controllers/toolController');

router.post('/lab-report', protect, generateLabReport);
router.post('/ai-roadmap', protect, generateRoadmap);

module.exports = router;