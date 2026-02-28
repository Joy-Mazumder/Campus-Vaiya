const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { saveGPA, getGPAHistory, generateLabReport, generateRoadmap } = require('../controllers/toolController');

router.post('/lab-report', protect, generateLabReport);
router.post('/ai-roadmap', protect, generateRoadmap);
router.post('/save-gpa', protect, saveGPA);
router.get('/gpa-history', protect, getGPAHistory);

module.exports = router;