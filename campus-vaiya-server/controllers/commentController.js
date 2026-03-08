const Comment = require('../models/Comment');
const Post = require('../models/Post');

// ১. কমেন্ট বা রিপ্লাই তৈরি করা
exports.createComment = async (req, res) => {
  try {
    const { content, postId, parentId } = req.body;
    
    const comment = new Comment({
      content,
      postId,
      parentId: parentId || null,
      author: req.user._id
    });

    await comment.save();
    
    // পোস্ট মডেলে কমেন্ট কাউন্ট বা রেফারেন্স আপডেট করতে চাইলে (Optional)
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    const populatedComment = await comment.populate('author', 'fullName profilePic');
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ২. কোনো পোস্টের সব কমেন্ট দেখা (Replies সহ)
exports.getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('author', 'fullName profilePic')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৩. কমেন্টে ভোট দেওয়া (Toggle Logic)
exports.voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (type === 'upvote') {
      if (comment.upvotes.includes(userId)) {
        comment.upvotes.pull(userId);
      } else {
        comment.upvotes.addToSet(userId);
        comment.downvotes.pull(userId);
      }
    } else {
      if (comment.downvotes.includes(userId)) {
        comment.downvotes.pull(userId);
      } else {
        comment.downvotes.addToSet(userId);
        comment.upvotes.pull(userId);
      }
    }

    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};