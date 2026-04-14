const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
  try {
    const { 
      fullName, email, password, currentClass, specialities, availableForHelp, 
      bio, careerGoal, totalSemesters, skills, 
      github, linkedin, facebook 
    } = req.body;
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ১. ইমেইল আপডেট এবং ইউনিক চেক
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "This email is already taken by another user." });
      }
      user.email = email;
    }

    // ২. পাসওয়ার্ড আপডেট (হ্যাশ করে সেভ করা হবে)
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    }

    // ৩. ক্লাস আপডেট এবং র‍্যাঙ্ক ক্যালকুলেশন
    if (currentClass) {
      const newClass = parseInt(currentClass);
      user.currentClass = newClass;
      
      // র‍্যাঙ্ক পুনরায় হিসাব করা (আপনার প্রোফাইল লজিক অনুযায়ী)
      let calculatedRank = newClass;
      if (user.educationLevel === 'College') calculatedRank = 10 + newClass;
      if (user.educationLevel === 'University') calculatedRank = 12 + newClass;
      if (user.educationLevel === 'Masters') calculatedRank = 17;
      if (user.educationLevel === 'PhD') calculatedRank = 18;
      
      user.rank = calculatedRank;
      user.lastClassUpdate = Date.now();
    }

    // অন্যান্য সাধারণ আপডেট
    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;
    user.careerGoal = careerGoal || user.careerGoal;
    user.totalSemesters = totalSemesters || user.totalSemesters;
    
    if (specialities) user.specialities = specialities.split(',').map(s => s.trim());
    if (skills) user.skills = skills.split(',').map(s => s.trim());

    user.helpSettings.available = availableForHelp === 'true' || availableForHelp === true;
    
    user.socialLinks = {
      github: github || user.socialLinks?.github || '',
      linkedin: linkedin || user.socialLinks?.linkedin || '',
      facebook: facebook || user.socialLinks?.facebook || ''
    };

    if (req.file) {
      user.profilePic = req.file.path;
    }

    const updatedUser = await user.save();
    
    // ফ্রন্টএন্ডের জন্য রেসপন্স (পাসওয়ার্ড বাদে সব ডাটা পাঠানো হচ্ছে)
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      reputationPoints: updatedUser.reputationPoints,
      badge: updatedUser.badge,
      rank: updatedUser.rank,
      educationLevel: updatedUser.educationLevel,
      currentClass: updatedUser.currentClass,
      institution: updatedUser.institution,
      bio: updatedUser.bio,
      careerGoal: updatedUser.careerGoal,
      totalSemesters: updatedUser.totalSemesters,
      specialities: updatedUser.specialities,
      skills: updatedUser.skills,
      socialLinks: updatedUser.socialLinks,
      helpSettings: updatedUser.helpSettings
    });

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