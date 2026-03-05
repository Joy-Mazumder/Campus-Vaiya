const User = require('../models/User');
const Institution = require('../models/Institution');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, educationLevel, currentClass, referralCode, manualInstitution } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    let calculatedRank = parseInt(currentClass);
    if (educationLevel === 'College') calculatedRank = 10 + parseInt(currentClass);
    if (educationLevel === 'University') calculatedRank = 12 + parseInt(currentClass);
    if (educationLevel === 'Masters') calculatedRank = 17;
    if (educationLevel === 'PhD') calculatedRank = 18;

    let institutionId = null;
    let isApproved = true;

    if (referralCode) {
      const inst = await Institution.findOne({ referralCode });
      if (inst) {
        institutionId = inst._id;
        if (inst.isRestricted) isApproved = false;
      } else {
        return res.status(400).json({ message: "Invalid Referral Code!" });
      }
    } else if (manualInstitution) {
      let inst = await Institution.findOne({ name: { $regex: new RegExp(`^${manualInstitution}$`, 'i') } });
      
      if (!inst) {
        // নতুন ইন্সটিটিউশন এন্ট্রি তৈরির সময় একটি র‍্যান্ডম রেফারেল কোড জেনারেট করা হলো
        const randomRef = `CV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        inst = await Institution.create({
          name: manualInstitution,
          slug: manualInstitution.toLowerCase().split(' ').join('-') + '-' + Math.floor(1000 + Math.random() * 9000),
          type: educationLevel,
          referralCode: randomRef, // এই লাইনের কারণে আর ডুপ্লিকেট এরর আসবে না
          isVerified: false
        });
      }
      institutionId = inst._id;
    }

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      educationLevel,
      currentClass,
      rank: calculatedRank,
      institution: institutionId,
      isApproved,
      institutionRole: institutionId ? 'Student' : 'Guest'
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      token: generateToken(user._id),
      message: isApproved ? "Success!" : "Registered! Waiting for approval."
    });
  } catch (error) {
    // যদি ডাটাবেজে অন্য কোনো ইউনিক এরর আসে
    if (error.code === 11000) {
        return res.status(400).json({ message: "Institution name or Referral code already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

// Login Logic (unchanged)
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).populate('institution');
  
      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          educationLevel: user.educationLevel,
          currentClass: user.currentClass,
          rank: user.rank,
          institution: user.institution,
          reputationPoints: user.reputationPoints,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };