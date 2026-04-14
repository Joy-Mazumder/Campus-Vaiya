const express = require('express');
const router = express.Router();
const {
  saveGPA, getGPAHistory,
  generateLabReport,
  generateCoverPage,
  generateAssignment,
  generateAiRoadmap
} = require('../controllers/toolController');
const { protect } = require('../middlewares/authMiddleware');

// GPA Routes
router.post('/save-gpa', protect, saveGPA);
router.get('/gpa-history', protect, getGPAHistory);

// Document Generator Routes
router.post('/generate-lab-report', protect, generateLabReport);
router.post('/generate-cover-page', protect, generateCoverPage);
router.post('/generate-assignment', protect, generateAssignment);

// AI Routes
router.post('/generate-roadmap', protect, generateAiRoadmap);

module.exports = router;
