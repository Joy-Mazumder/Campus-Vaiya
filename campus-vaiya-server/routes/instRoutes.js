const express = require('express');
const router = express.Router();
const instController = require('../controllers/instController');
const { protect, instAdminProtect } = require('../middlewares/authMiddleware');
const { adminProtect } = require('../middlewares/adminMiddleware');
const { upload } = require('../config/cloudinary');

// ==========================
// ⚠️ IMPORTANT: Static routes MUST come before dynamic /:param routes
// ==========================

// ==========================
// 1. Static Public Routes
// ==========================
router.get('/search', instController.searchInstitutions);
router.get('/details/:id', instController.getInstitutionDetails);

// ==========================
// 2. Auth Required — Static paths
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
// Branding
router.put('/branding', protect, instAdminProtect, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), instController.updateInstitutionBranding);

// Finance
router.post('/finance/collect-fee', protect, instAdminProtect, instController.collectStudentFee);
router.post('/finance/expense', protect, instAdminProtect, instController.addExpense);

// Result
router.post('/result/publish', protect, instAdminProtect, instController.publishResult);

// Campus Feed
router.post('/feed/post', protect, instAdminProtect, upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), instController.createInstitutionPost);

// Personality
router.post('/personality', protect, instAdminProtect, upload.fields([{ name: 'image', maxCount: 1 }]), instController.addPersonality);
router.delete('/personality/:id', protect, instAdminProtect, instController.deletePersonality);

// General entries
router.post('/notice', protect, instAdminProtect, instController.createNotice);
router.post('/batch', protect, instAdminProtect, instController.addBatch);
router.post('/teacher', protect, instAdminProtect, instController.addTeacher);
router.post('/achievement', protect, instAdminProtect, instController.addAchievement);

// ==========================
// 5. Department & Subcategory Routes (Admin)
// NOTE: Static department routes BEFORE dynamic /:instId routes
// ==========================
router.post('/departments', protect, instAdminProtect, instController.addDepartment);
router.put('/departments/:deptId', protect, instAdminProtect, instController.updateDepartment);
router.delete('/departments/:deptId', protect, instAdminProtect, instController.deleteDepartment);
router.post('/departments/:deptId/subcategories', protect, instAdminProtect, instController.addSubcategory);
router.put('/departments/:deptId/subcategories/:subId', protect, instAdminProtect, instController.updateSubcategory);
router.delete('/departments/:deptId/subcategories/:subId', protect, instAdminProtect, instController.deleteSubcategory);

// ==========================
// 6. System Admin Only
// ==========================
router.put('/claim/approve/:claimId', protect, adminProtect, instController.approveClaim);

// ==========================
// 7. Dynamic /:param routes — MUST BE LAST
// ==========================
router.get('/:instId/personalities', instController.getPersonalities);
router.get('/:instId/departments', instController.getDepartments);
router.get('/:instId/notices', instController.getNotices);
router.get('/:instId/batches', instController.getBatches);

// Delete — dynamic
router.delete('/:type/:id', protect, instAdminProtect, instController.deleteItem);

module.exports = router;
