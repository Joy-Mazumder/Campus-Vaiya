const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { adminProtect } = require('../middlewares/adminMiddleware');
const { getPendingRequests, approveInstitution } = require('../controllers/adminController');

router.get('/pending-institutions', protect, adminProtect, getPendingRequests);
router.put('/approve-institution/:id', protect, adminProtect, approveInstitution);

module.exports = router;