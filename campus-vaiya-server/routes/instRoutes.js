const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createNotice, getNotices, requestInstitution, getApprovedInstitutions } = require('../controllers/instController');


router.post('/apply', requestInstitution);
router.get('/notices', protect, getNotices);
router.post('/notice', protect, createNotice);
router.get('/approved-list', getApprovedInstitutions);

module.exports = router;