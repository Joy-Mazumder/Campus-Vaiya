const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');
const { uploadResource, getResources, upvoteResource } = require('../controllers/resourceController');

router.post('/upload', protect, upload.single('file'), uploadResource);
router.get('/', protect, getResources);
router.put('/vote/:id', protect, upvoteResource);

module.exports = router;