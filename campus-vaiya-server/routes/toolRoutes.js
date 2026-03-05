const express = require('express');
const router = express.Router();
const { saveGPA, getGPAHistory, generateLabReport, generateAiRoadmap } = require('../controllers/toolController');
const { protect } = require('../middlewares/authMiddleware');

// GPA Routes
router.post('/save-gpa', protect, saveGPA);
router.get('/gpa-history', protect, getGPAHistory);

// Lab Report & AI Routes
router.post('/generate-lab-report', protect, generateLabReport);
router.post('/generate-roadmap', protect, generateAiRoadmap);

module.exports = router;