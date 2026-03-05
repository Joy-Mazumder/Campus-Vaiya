const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    const { content, postType, visibility, subject, semester } = req.body;
    
    // ইউজার কি লগইন করা? চেক করুন
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const postData = {
      author: req.user._id,
      content,
      postType: postType || 'Social',
      visibility: visibility || 'global',
      // population থাকলে ._id ব্যবহার করা জরুরি
      institution: req.user.institution?._id || req.user.institution || null,
      subject,
      semester,
      
    };

    if (req.files) {
      if (req.files.media && req.files.media[0]) {
        postData.media = req.files.media[0].path;
      }
      if (req.files.file && req.files.file[0]) {
        postData.file = req.files.file[0].path;
      }
    }

    const post = await Post.create(postData);

    // ফ্রন্টএন্ডে পাঠানোর আগে অথর ডাটা পপুলেট করে দিন
    const populatedPost = await post.populate('author', 'fullName profilePic');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Post Creation Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// --- Feed Logic ---
exports.getFeed = async (req, res) => {
  try {
    const { mode, page = 1 } = req.query;
    const limit = 10;
    let query = {};

    if (mode === 'campus') {
      const instId = req.user.institution?._id || req.user.institution;
      if (!instId) return res.json([]);
      query = { institution: instId, visibility: 'campus' };
    } else if (mode === 'friends') {
      const user = await User.findById(req.user._id);
      query = { author: { $in: user.connections }, visibility: 'friends' };
    } else {
      query = { visibility: 'global' };
    }

    const posts = await Post.find(query)
      .populate('author', 'fullName profilePic badge reputationPoints')
      .populate('institution', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Vote Logic ---
exports.votePost = async (req, res) => {
  try {
    const { type } = req.body;
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (type === 'upvote') {
      if (post.upvotes.includes(userId)) return res.status(400).json({ message: "Already upvoted" });
      post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());
      post.upvotes.push(userId);
      await User.findByIdAndUpdate(post.author, { $inc: { reputationPoints: 4 } });
    } 
    else if (type === 'downvote') {
      if (post.downvotes.includes(userId)) return res.status(400).json({ message: "Already downvoted" });
      post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
      post.downvotes.push(userId);
      await User.findByIdAndUpdate(post.author, { $inc: { reputationPoints: -2 } });
    } else if (type === 'remove') {
       if (post.upvotes.includes(userId)) {
         post.upvotes.pull(userId);
         await User.findByIdAndUpdate(post.author, { $inc: { reputationPoints: -4 } }); // পয়েন্ট ব্যাক
       } else if (post.downvotes.includes(userId)) {
         post.downvotes.pull(userId);
         await User.findByIdAndUpdate(post.author, { $inc: { reputationPoints: 2.4 } }); // পয়েন্ট রিস্টোর
      }
    }

    await post.save();
    res.json({ message: "Vote registered", upvotes: post.upvotes.length, downvotes: post.downvotes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};