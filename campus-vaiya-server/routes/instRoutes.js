const express = require('express');
const router = express.Router();
const instController = require('../controllers/instController');
const { protect, instAdminProtect } = require('../middlewares/authMiddleware');
const { adminProtect } = require('../middlewares/adminMiddleware');
const { upload } = require('../config/cloudinary');

// ==========================
// ⚠️ IMPORTANT: Static routes MUST come before dynamic /:param routes
// Otherwise Express matches /:instId before /details, /search, etc.
// ==========================

// ==========================
// 1. Static Public Routes (এগুলো সবার আগে থাকতে হবে)
// ==========================
router.get('/search', instController.searchInstitutions);
router.get('/details/:id', instController.getInstitutionDetails);

// ==========================
// 2. Auth Required — Static paths (protect করা, কিন্তু dynamic param নেই)
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
router.get('/result/my-results', protect, instController.getMyResults);
router.get('/feed/campus', protect, instController.getCampusFeed);

// ==========================
// 3. Auth Required — Dynamic param routes (finance, result)
// ==========================
router.get('/finance/my-fees/:instId', protect, instController.getStudentFeeStatus);
router.get('/finance/summary/:instId', protect, instAdminProtect, instController.getFinanceSummary);
router.get('/result/batch/:batchId', protect, instAdminProtect, instController.getBatchResults);

// ==========================
// 4. Institution Admin Only
// ==========================
// ব্র্যান্ডিং আপডেট
router.put('/branding', protect, instAdminProtect, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), instController.updateInstitutionBranding);

// ফিন্যান্স
router.post('/finance/collect-fee', protect, instAdminProtect, instController.collectStudentFee);
router.post('/finance/expense', protect, instAdminProtect, instController.addExpense);

// রেজাল্ট
router.post('/result/publish', protect, instAdminProtect, instController.publishResult);

// ক্যাম্পাস পোস্ট/ফিড
router.post('/feed/post', protect, instAdminProtect, upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), instController.createInstitutionPost);
router.post('/personality', protect, instAdminProtect, upload.fields([{ name: 'image', maxCount: 1 }]), instController.addPersonality);

// জেনারেল এন্ট্রি
router.post('/notice', protect, instAdminProtect, instController.createNotice);
router.post('/batch', protect, instAdminProtect, instController.addBatch);
router.post('/teacher', protect, instAdminProtect, instController.addTeacher);
router.post('/achievement', protect, instAdminProtect, instController.addAchievement);
router.delete('/personality/:id', protect, instAdminProtect, instController.deletePersonality);

// ==========================
// 5. System Admin Only
// ==========================
router.put('/claim/approve/:claimId', protect, adminProtect, instController.approveClaim);

// ==========================
// 6. Dynamic /:param routes — সবার শেষে (MUST BE LAST)
// ==========================
// এই দুটো route /:param pattern, তাই এগুলো সবার নিচে থাকতে হবে
// নাহলে /search, /details, /my-managed সব কিছু /:instId হিসেবে match করে ফেলে
router.get('/:instId/personalities', instController.getPersonalities);

router.get('/:instId/notices', instController.getNotices);
router.get('/:instId/batches', instController.getBatches);

// ডিলিট — এটাও dynamic
router.delete('/:type/:id', protect, instAdminProtect, instController.deleteItem);

module.exports = router;