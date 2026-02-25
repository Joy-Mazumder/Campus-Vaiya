const router = express.Router();
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { requestInstitution, getApprovedInstitutions } = require('../controllers/instController');


router.post('/apply', requestInstitution);
router.get('/notices', protect, getNotices);
router.post('/notice', protect, createNotice);
router.get('/approved-list', getApprovedInstitutions);

module.exports = router;