const express = require('express');
const router = express.Router();
const { updateTarget, updateProfile, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');
const userController = require('../controllers/userController');

router.get('/profile', protect, getUserProfile);
router.put('/update', protect, upload.single('profilePic'), updateProfile);
router.put('/update-target', protect, updateTarget);
router.get('/connections', protect, userController.getConnections);
router.post('/connect/:id', protect, userController.sendConnectionRequest);

module.exports = router;