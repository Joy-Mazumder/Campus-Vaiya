const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { publishResult, getMyResults, createNotice, getNotices, requestInstitution, getApprovedInstitutions } = require('../controllers/instController');


router.post('/apply', requestInstitution);
router.get('/notices', protect, getNotices);
router.post('/notice', protect, createNotice);
router.get('/approved-list', getApprovedInstitutions);
router.post('/publish-result', protect, publishResult);
router.get('/my-results', protect, getMyResults);

module.exports = router;