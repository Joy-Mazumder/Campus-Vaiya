const express = require('express');
const router = express.Router();
const { uploadResource, getMyUploads, deleteResource } = require('../controllers/resourceController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// protect মিডলওয়্যার অবশ্যই থাকতে হবে
router.post('/upload', protect, upload.single('file'), uploadResource);
router.get('/my-uploads', protect, getMyUploads);
router.delete('/delete/:id', protect, deleteResource);

module.exports = router;