const express = require('express');
const router = express.Router();
const {
  mathSolver,
  scienceExplainer,
  grammarFixer,
  digitizeNotes,
  researchSummarizer,
  plagiarismChecker,
  literatureReview,
  researchGapFinder,
} = require('../controllers/studentToolsController');
const { protect } = require('../middlewares/authMiddleware');

// Class 8–12 / SSC / HSC tools
router.post('/math-solver',         protect, mathSolver);
router.post('/science-explainer',   protect, scienceExplainer);
router.post('/grammar-fixer',       protect, grammarFixer);
router.post('/digitize-notes',      protect, digitizeNotes);

// University / Research tools
router.post('/research-summarizer', protect, researchSummarizer);
router.post('/plagiarism-checker',  protect, plagiarismChecker);
router.post('/literature-review',   protect, literatureReview);
router.post('/research-gap-finder', protect, researchGapFinder);

module.exports = router;
