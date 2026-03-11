const express = require('express');
const router = express.Router();
const instController = require('../controllers/instController');
const { protect, instAdminProtect } = require('../middlewares/authMiddleware');
const { adminProtect } = require('../middlewares/adminMiddleware'); // আপনার সিস্টেম অ্যাডমিন মিডলওয়্যার
const { upload } = require('../config/cloudinary');

// ==========================
// 1. Public & Search (সবার জন্য)
// ==========================
router.get('/search', instController.searchInstitutions);
router.get('/:instId/notices', instController.getNotices);
router.get('/:instId/batches', instController.getBatches);

// ==========================
// 2. Auth Required (যেকোনো লগইন করা ইউজার/স্টুডেন্ট)
// ==========================
router.post('/create', protect, upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'idCard', maxCount: 1 }
]), instController.createInstitution);

router.post('/claim', protect, upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'idCard', maxCount: 1 }
]), instController.submitClaim);

router.get('/my-managed', protect, instController.getMyManagedInstitution);
router.get('/finance/my-fees/:instId', protect, instController.getStudentFeeStatus);
router.get('/result/my-results', protect, instController.getMyResults);
router.get('/feed/campus', protect, instController.getCampusFeed);

// ==========================
// 3. Institution Admin Only (মালিক/অ্যাডমিনদের জন্য)
// ==========================
// ব্র্যান্ডিং আপডেট
router.put('/branding', protect, instAdminProtect, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), instController.updateInstitutionBranding);

// ফিন্যান্স ম্যানেজমেন্ট
router.post('/finance/collect-fee', protect, instAdminProtect, instController.collectStudentFee);
router.post('/finance/expense', protect, instAdminProtect, instController.addExpense);
router.get('/finance/summary/:instId', protect, instAdminProtect, instController.getFinanceSummary);

// রেজাল্ট পাবলিশ
router.post('/result/publish', protect, instAdminProtect, instController.publishResult);
router.get('/result/batch/:batchId', protect, instAdminProtect, instController.getBatchResults);

// ক্যাম্পাস পোস্ট/ফিড
router.post('/feed/post', protect, instAdminProtect, upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), instController.createInstitutionPost);

// জেনারেল এন্ট্রি (Notice, Batch, Teacher)
router.post('/notice', protect, instAdminProtect, instController.createNotice);
router.post('/batch', protect, instAdminProtect, instController.addBatch);
router.post('/teacher', protect, instAdminProtect, instController.addTeacher);
router.post('/achievement', protect, instAdminProtect, instController.addAchievement);

// ডিলিট অপারেশন
router.delete('/:type/:id', protect, instAdminProtect, instController.deleteItem);

// ==========================
// 4. System Admin Only (আপনার জন্য)
// ==========================
// ক্লেইম অ্যাপ্রুভ করা
router.put('/claim/approve/:claimId', protect, adminProtect, instController.approveClaim);

module.exports = router;