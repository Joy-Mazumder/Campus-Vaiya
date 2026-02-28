const Resource = require('../models/Resource');

exports.uploadResource = async (req, res) => {
    try {
        const { title, description, subject, semester, isGlobal } = req.body;
        
        if (!req.file) return res.status(400).json({ message: "Please upload a file" });

        const resource = await Resource.create({
            title,
            description,
            subject,
            semester,
            fileUrl: req.file.path, 
            fileType: req.file.mimetype,
            uploadedBy: req.user.id,
            universityId: req.user.universityId,
            isGlobal: isGlobal === 'true' ? true : false
        });

        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getResources = async (req, res) => {
    try {
        const userUniId = req.user.universityId;
        
        const resources = await Resource.find({
            $or: [
                { universityId: userUniId },
                { isGlobal: true }
            ]
        }).populate('uploadedBy', 'fullName badge').sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.upvoteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });

        if (resource.upvotes.includes(req.user.id)) {
            resource.upvotes = resource.upvotes.filter(id => id.toString() !== req.user.id);
        } else {
            resource.upvotes.push(req.user.id);
            resource.downvotes = resource.downvotes.filter(id => id.toString() !== req.user.id);
        }

        await resource.save();
        // upvoteResource ফাংশনের ভেতরে যখন কেউ আপভোট দিবে:
        const author = await User.findById(resource.uploadedBy);
        author.reputationPoints += 1; 
        await author.save();
        res.json({ upvotes: resource.upvotes.length, downvotes: resource.downvotes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// controllers/resourceController.js
exports.getFeed = async (req, res) => {
    const user = await User.findById(req.user.id);
    const friendIds = user.friends;

    const feedPosts = await Resource.find({
        $or: [
            { uploadedBy: { $in: friendIds } }, // ফ্রেন্ডদের পোস্ট
            { universityId: user.universityId }, // নিজের ভার্সিটির পোস্ট
            { isGlobal: true, upvotesCount: { $gt: 10 } } // গ্লোবাল টপ পোস্ট
        ]
    })
    .sort({ createdAt: -1 })
    .populate('uploadedBy', 'fullName reputationPoints badge');

    res.json(feedPosts);
};