const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
    const { subject, category, topic, description } = req.body;
    let images = [];
    let pdfUrl = "";

    if (req.files) {
        if (req.files.images) {
            images = req.files.images.map(file => file.path); 
        }
        if (req.files.pdf) {
            pdfUrl = req.files.pdf[0].path;
        }
    }

    const newRequest = await HelpRequest.create({
      sender: req.user._id,
      subject,
      category,
      topic,
      description,
      images, 
      pdf: pdfUrl,
      senderRank: req.user.rank,
      targetRankMin: req.user.rank + 1,
      institution: req.user.institution
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailableRequests = async (req, res) => {
  try {
    const user = req.user;
    if (!user.helpSettings.available) return res.json([]);

    let query = {
      status: 'Open',
      targetRankMin: { $lte: user.rank },
      sender: { $ne: user._id }
    };

    if (user.specialities?.length > 0) {
      query.subject = { $in: user.specialities };
    }

    const requests = await HelpRequest.find(query)
      .populate('sender', 'fullName profilePic currentClass reputationPoints')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// নতুন ফাংশন: ইউজারের এক্সেপ্ট করা রিকোয়েস্ট দেখতে
exports.getMyAcceptedRequests = async (req, res) => {
    try {
        const requests = await HelpRequest.find({
            acceptedBy: req.user._id,
            status: 'Accepted'
        }).populate('sender', 'fullName');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.acceptRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    if (!request || request.status !== 'Open') {
      return res.status(400).json({ message: "Request not available" });
    }

    request.status = 'Accepted';
    request.acceptedBy = req.user._id;
    request.acceptedAt = new Date();
    await request.save();

    res.json({ message: "Accepted!", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitSolution = async (req, res) => {
  try {
    const { text } = req.body;
    const solutionImagePath = req.file ? req.file.path : ""; // req.file থেকে নেওয়া হয়েছে
    
    const request = await HelpRequest.findById(req.params.id);
    if (request.acceptedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    request.status = 'Solved';
    request.solution = { 
        text, 
        image: solutionImagePath, 
        solvedAt: new Date(),
        votes: { up: [], down: [] } 
    };
    await request.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { reputationPoints: 14 } });

    res.json({ message: "Solution submitted! +14 points earned." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.browseHelpRequests = async (req, res) => {
    try {
      const requests = await HelpRequest.find({ status: 'Solved' })
        .populate('sender', 'fullName profilePic rank')
        .populate('acceptedBy', 'fullName reputationPoints')
        .sort({ updatedAt: -1 });
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

// ৫. ভোট সিস্টেম (Upvote +4, Downvote -2)
exports.voteSolution = async (req, res) => {
    try {
      const { type } = req.body; // 'up' or 'down'
      const request = await HelpRequest.findById(req.params.id);
      const seniorId = request.acceptedBy;
  
      if (type === 'up') {
        request.solution.votes.up.push(req.user._id);
        await User.findByIdAndUpdate(seniorId, { $inc: { reputationPoints: 4 } });
      } else {
        request.solution.votes.down.push(req.user._id);
        await User.findByIdAndUpdate(seniorId, { $inc: { reputationPoints: -2 } });
      }
  
      await request.save();
      res.json({ message: "Vote recorded" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  