const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpControllers');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary'); // cloudinary.js থেকে ইমপোর্ট করুন

router.post('/create', protect, upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'pdf', maxCount: 1 }
]), helpController.createRequest);

router.get('/available', protect, helpController.getAvailableRequests);
router.get('/my-accepted', protect, helpController.getMyAcceptedRequests); // ফ্রন্টএন্ডের জন্য জরুরি
router.get('/solved', helpController.browseHelpRequests); // ফ্রন্টএন্ডের 'solved' রাউটের জন্য
router.get('/browse', helpController.browseHelpRequests);

router.put('/accept/:id', protect, helpController.acceptRequest);
router.put('/solve/:id', protect, upload.single('solutionImage'), helpController.submitSolution);
router.post('/vote/:id', protect, helpController.voteSolution);

module.exports = router;