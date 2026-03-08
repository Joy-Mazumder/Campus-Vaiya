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
    const skip = (parseInt(page) - 1) * limit;
    const now = new Date();

    // ইউজারের দেখা পোস্টগুলো ফিল্টার করতে (Optional but Recommended)
    const viewedPosts = req.user.viewedPosts || []; 

    let matchQuery = {};
    if (mode === 'campus') {
      const instId = req.user.institution?._id || req.user.institution;
      if (!instId) return res.json([]);
      matchQuery = { institution: instId, visibility: 'campus' };
    } else if (mode === 'friends') {
      const user = await User.findById(req.user._id);
      matchQuery = { author: { $in: user.connections }, visibility: 'friends' };
    } else {
      matchQuery = { visibility: 'global' };
    }

    const posts = await Post.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          // ১. এনগেজমেন্ট কাউন্ট বের করা
          upvoteCount: { $size: { $ifNull: ["$upvotes", []] } },
          commentCount: { $size: { $ifNull: ["$comments", []] } },
          // পোস্টের বয়স (ঘণ্টায়) - র‍্যাঙ্কিংয়ের জন্য ঘণ্টা বেশি কার্যকর
          ageInHours: {
            $divide: [{ $subtract: [now, "$createdAt"] }, 3600000]
          },
          // ইউজার কি অলরেডি এটা দেখেছে?
          isSeen: { $in: ["$_id", viewedPosts] }
        }
      },
      {
        $addFields: {
          // ২. এনগেজমেন্ট স্কোর (লাইক = ১০, কমেন্ট = ৫০ পয়েন্ট)
          engagementScore: {
            $add: [
              { $multiply: ["$upvoteCount", 10] },
              { $multiply: ["$commentCount", 50] },
              // রিসোর্স পোস্ট হলে এক্সট্রা ১০০ পয়েন্ট বোনাস
              { $cond: [{ $eq: ["$postType", "Resource"] }, 100, 0] }
            ]
          }
        }
      },
      {
        $addFields: {
          // ৩. স্মার্ট র‍্যাঙ্কিং ফর্মুলা (Score / (Age + 2)^Gravity)
          // Gravity ১.৮ হলে পুরনো পোস্ট দ্রুত নিচে নামে
          dynamicScore: {
            $divide: [
              "$engagementScore",
              { $pow: [{ $add: ["$ageInHours", 2] }, 1.8] }
            ]
          }
        }
      },
      {
        $addFields: {
          // ৪. ফাইনাল প্রায়োরিটি স্কোর
          finalScore: {
            $add: [
              "$dynamicScore",
              // নতুন পোস্ট বুস্ট: প্রথম ১০ মিনিটে বিশাল পুশ
              { $cond: [{ $lt: ["$ageInHours", 0.16] }, 500, 0] }, 
              // দেখা পোস্ট হলে স্কোর কমিয়ে দাও (পেনাল্টি)
              { $cond: ["$isSeen", -100, 0] }
            ]
          }
        }
      },
      { $sort: { finalScore: -1 } }, 
      { $skip: skip },
      { $limit: limit },
      // ৫. পপুলেট (সবার শেষে করলে পারফরম্যান্স ভালো থাকে)
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $project: {
          "author.password": 0,
          "author.email": 0,
          "dynamicScore": 0,
          "engagementScore": 0
        }
      }
    ]);

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