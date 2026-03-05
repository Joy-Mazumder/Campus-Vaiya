const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// ফিড এবং পোস্ট
router.get('/feed', protect, postController.getFeed);
router.post('/create', protect, upload.fields([{ name: 'media', maxCount: 1 }, { name: 'file', maxCount: 1 }]), postController.createPost);

// ভোট (Upvote/Downvote)
router.put('/vote/:id', protect, postController.votePost);

// কানেকশনস
router.post('/connect/:id', protect, userController.sendConnectionRequest);
router.get('/connections', protect, userController.getConnections);

module.exports = router;