const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

// ১. জুনিয়র যখন রিকোয়েস্ট পাঠাবে
// এই অংশটি createRequest ফাংশনের ভেতর লজিক হিসেবে থাকবে
exports.createRequest = async (req, res) => {
  try {
    const { subject, category, topic, description } = req.body;
    let images = [];
    let pdfUrl = "";

    // যদি ইমেজ থাকে তবে ক্লাউডিনারি থেকে আসা ইউআরএল গুলো সেভ হবে
    if (req.files && req.files.images) {
      images = req.files.images.map(file => file.path); 
    }
    
    // যদি PDF থাকে
    if (req.files && req.files.pdf) {
      pdfUrl = req.files.pdf[0].path;
    }

    const newRequest = await HelpRequest.create({
      sender: req.user._id,
      subject,
      category,
      topic,
      description,
      images, //
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

// ২. সিনিয়রদের জন্য স্পেশালিটি অনুযায়ী রিকোয়েস্ট লিস্ট
exports.getAvailableRequests = async (req, res) => {
  try {
    const { mode } = req.query; 
    const user = req.user;

    // যদি ইউজার তার হেল্প অপশন অফ করে রাখে
    if (!user.helpSettings.available) {
      return res.json([]);
    }

    let query = {
      status: 'Open',
      targetRankMin: { $lte: user.rank }, // শুধু ছোটদের রিকোয়েস্ট দেখবে
      sender: { $ne: user._id }
    };

    // সিনিয়র যদি নির্দিষ্ট সাবজেক্ট পছন্দ করে থাকে (Specialities Filter)
    if (user.specialities && user.specialities.length > 0) {
      query.subject = { $in: user.specialities };
    }

    if (mode === 'campus') {
      query.institution = user.institution;
    }

    const requests = await HelpRequest.find(query)
      .populate('sender', 'fullName profilePic currentClass reputationPoints')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৩. সিনিয়র রিকোয়েস্ট এক্সেপ্ট করলে
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

    res.json({ message: "Accepted! Please provide a solution within 24h.", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৪. সলিউশন সাবমিট করা (+১৪ পয়েন্ট লজিক)
exports.submitSolution = async (req, res) => {
  try {
    const { text, image } = req.body;
    const request = await HelpRequest.findById(req.params.id);

    if (request.acceptedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    request.status = 'Solved';
    request.solution = { text, image, solvedAt: new Date() };
    await request.save();

    // সিনিয়রকে +১৪ পয়েন্ট দেওয়া
    await User.findByIdAndUpdate(req.user._id, { $inc: { reputationPoints: 14 } });

    res.json({ message: "Solution submitted! You earned +14 points." });
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

  exports.browseHelpRequests = async (req, res) => {
  try {
    const { subject, currentClass, category } = req.query;
    let query = { status: 'Solved' }; // সাধারণত সলভড ইস্যুগুলোই মানুষ দেখে শিখবে

    if (subject) query.subject = subject;
    if (category) query.category = category;
    
    // ক্লাস অনুযায়ী ফিল্টার (যেমন: ক্লাস ৯ এর সব প্রবলেম দেখতে চাওয়া)
    if (currentClass) {
      // রিকোয়েস্ট যখন করা হয়েছিল তখন সেন্ডারের র‍্যাঙ্ক/ক্লাস কত ছিল
      query.senderRank = currentClass; 
    }

    const requests = await HelpRequest.find(query)
      .populate('sender', 'fullName profilePic rank')
      .populate('acceptedBy', 'fullName reputationPoints')
      .sort({ updatedAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};