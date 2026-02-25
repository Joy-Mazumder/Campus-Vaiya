const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { toggleAvailability, createHelpRequest } = require('../controllers/chatController');

router.put('/toggle-status', protect, toggleAvailability);
router.post('/request', protect, createHelpRequest);

module.exports = router;