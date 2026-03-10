const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary'); 

// Connections (Friend Requests)
router.post('/request', protect, messageController.sendRequest);
router.put('/accept/:requestId', protect, messageController.acceptRequest);
router.delete('/connection/:connectionId', protect, messageController.deleteConnection);
router.get('/my-connections', protect, messageController.getMyConnections);

// Chatting
router.get('/conversations', protect, messageController.getConversations);
router.get('/messages/:conversationId', protect, messageController.getMessages);
router.post('/send', protect, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), messageController.sendMessage);

// Deleting
router.put('/message/unsend/:messageId', protect, messageController.deleteMessage);
router.delete('/conversation/all/:conversationId', protect, messageController.deleteFullConversation);

module.exports = router;