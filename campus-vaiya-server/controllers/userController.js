const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, currentClass, specialities, availableForHelp } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = fullName || user.fullName;
      user.currentClass = currentClass || user.currentClass;
      user.specialities = specialities ? JSON.parse(specialities) : user.specialities;
      user.helpSettings.available = availableForHelp === 'true' ? true : false;

      // যদি নতুন ছবি আপলোড করা হয়
      if (req.file) {
        user.profilePic = req.file.path;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        reputationPoints: updatedUser.reputationPoints,
        badge: updatedUser.badge,
        institution: updatedUser.institution
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ইউজারের কমপ্লিট ডাটা পাওয়ার জন্য (Dashboard এ ব্যবহারের জন্য)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('institution');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PUT /api/users/update-target
// userController.js
exports.updateTarget = async (req, res) => {
  try {
    const { targetCGPA } = req.body;
    
    // parseFloat নিশ্চিত করে যে আমরা নাম্বার সেভ করছি
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { targetCGPA: parseFloat(targetCGPA) },
      { returnDocument: 'after' } 
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ১. কানেকশন রিকোয়েস্ট পাঠানো
exports.sendConnectionRequest = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const senderId = req.user._id;

    if (targetUserId === senderId.toString()) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (targetUser.pendingRequests.includes(senderId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    if (targetUser.connections.includes(senderId)) {
      return res.status(400).json({ message: "Already connected" });
    }

    targetUser.pendingRequests.push(senderId);
    await targetUser.save();

    res.json({ message: "Connection request sent!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. কানেকশন লিস্ট গেট করা (Sidebar-এর জন্য)
exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'connections',
      select: 'fullName profilePic badge reputationPoints rank'
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user.connections || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};