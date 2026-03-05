const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const instController = require('../controllers/instController');

router.get('/search', instController.searchInstitutions);
router.post('/create', protect, instController.createInstitution);
// router.get('/notices/:instId', protect, async (req, res) => {
//   try {
//     const notices = await Notice.find({ institution: req.params.instId }).sort({ createdAt: -1 });
//     res.json(notices);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// নোটিশ ক্রিয়েট করার রুট
router.get('/notices/:instId', protect, instController.getNotices);
router.get('/batches/:instId', protect, instController.getBatches);
router.get('/finance/:instId', protect, instController.getFinance);
router.get('/my-managed', protect, instController.getMyManagedInstitution);

// Create/Add Data Routes
router.post('/notices/create', protect, instController.createNotice);
router.post('/batchs/add', protect, instController.addBatch); // Dashboard এ batches/add আছে
router.post('/finances/add', protect, instController.addFinance); // Dashboard এ finances/add আছে
router.post('/teachers/add', protect, instController.addTeacher);
router.post('/achievements/add', protect, instController.addAchievement);

// Delete Route
router.delete('/:type/:id', protect, instController.deleteItem);

module.exports = router;