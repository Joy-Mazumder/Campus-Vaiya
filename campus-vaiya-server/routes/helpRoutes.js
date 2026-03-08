const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpControllers');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // মিডলওয়্যার ইমপোর্ট

// জুনিয়র রিকোয়েস্ট (একাধিক ইমেজ ও একটি PDF সাপোর্ট)
router.post('/create', protect, upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'pdf', maxCount: 1 }
]), helpController.createRequest);

// সিনিয়রের সলিউশন (একটি ইমেজ সাপোর্ট)
router.put('/solve/:id', protect, upload.single('solutionImage'), helpController.submitSolution);

// অন্যান্য রাউট (আগের মতো)
router.get('/available', protect, helpController.getAvailableRequests);
router.get('/browse', helpController.browseHelpRequests); 
router.put('/accept/:id', protect, helpController.acceptRequest);
router.post('/vote/:id', protect, helpController.voteSolution);

module.exports = router;