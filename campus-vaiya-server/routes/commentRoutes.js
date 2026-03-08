const express = require('express');
const router = express.Router();
const { createComment, getCommentsByPost, voteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

// ১. কমেন্ট বা রিপ্লাই তৈরি করা
// Path: POST /api/comments
router.post('/', protect, createComment);

// ২. কোনো নির্দিষ্ট পোস্টের সব কমেন্ট দেখা
// Path: GET /api/comments/post/:postId
router.get('/post/:postId', getCommentsByPost);

// ৩. কমেন্টে ভোট দেওয়া (Toggle)
// Path: PATCH /api/comments/:commentId/vote
router.patch('/:commentId/vote', protect, voteComment);

module.exports = router;