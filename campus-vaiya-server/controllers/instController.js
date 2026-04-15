const Institution = require('../models/Institution');
const User = require('../models/User');
const Notice = require('../models/Notice');
const Batch = require('../models/Batch');
const Post = require('../models/Post');
const Finance = require('../models/Finance');
const ClaimRequest = require('../models/ClaimRequest');
const Result = require('../models/Result');
const Notification = require('../models/Notification');
const NotablePersonality = require('../models/NotablePersonality');
const mongoose = require('mongoose');


exports.createInstitution = async (req, res) => {
  try {
    const { name, type, email, phone, eiinNumber, isRestricted, themeColor } = req.body;

    const existingInstitution = await Institution.findOne({ owner: req.user._id });
    if (existingInstitution) {
      return res.status(400).json({ message: "You already have an institution." });
    }

    const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const refCode = `CV-${Math.floor(100000 + Math.random() * 900000)}`;

    const verificationDetails = {};
    if (type === 'Coaching') {
      verificationDetails.ownerIdCard = req.files?.idCard ? req.files.idCard[0].path : null;
    } else {
      verificationDetails.eiinNumber = eiinNumber;
      verificationDetails.licensePdf = req.files?.license ? req.files.license[0].path : null;
    }

    const institution = new Institution({
      name,
      slug,
      type,
      owner: req.user._id,
      referralCode: refCode,
      isRestricted,
      themeColor: themeColor || '#2563eb',
      contact: { email, phone },
      verificationStatus: 'Approved',
      verificationDetails,
      isVerified: true
    });

    const savedInstitution = await institution.save();

    try {
        await User.findByIdAndUpdate(req.user._id, {
            institution: savedInstitution._id,
            institutionRole: 'Admin'
        });

        return res.status(201).json({
          message: "Institution created successfully!",
          institution: savedInstitution
        });

    } catch (userUpdateError) {
        await Institution.findByIdAndDelete(savedInstitution._id);
        return res.status(500).json({ message: "Failed to assign admin role. Try again." });
    }

  } catch (error) {
    console.error("Create Inst Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Name or Slug already exists. Try a different name." });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.searchInstitutions = async (req, res) => {
  try {
    let { q, type } = req.query;
    if (!q) return res.json([]);

    const searchTerm = q.trim();
    const words = searchTerm.split(/\s+/).map(word => `(?=.*${word})`).join("");
    const regex = new RegExp(words, 'i');

    const institutions = await Institution.find({
      type: type,
      $or: [
        { name: { $regex: regex } },
        { slug: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .limit(8)
    .select('name slug logo');

    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInstitutionBranding = async (req, res) => {
  try {
    const { themeColor, vision, mission, history, alumniHistory, admissionInfo, foundedYear, studentLife, research } = req.body;
    const updateData = { themeColor, vision, mission, history, alumniHistory, admissionInfo, foundedYear, studentLife, research };
    if (req.files?.logo) updateData.logo = req.files.logo[0].path;
    if (req.files?.banner) updateData.banner = req.files.banner[0].path;

    const inst = await Institution.findOneAndUpdate(
      { owner: req.user._id },
      updateData,
      { new: true }
    );
    res.json(inst);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ institution: req.params.instId }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ institutionId: req.params.instId });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFinance = async (req, res) => {
  try {
    const finances = await Finance.find({ institutionId: req.params.instId }).sort({ date: -1 });
    res.json(finances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const notice = await Notice.create({ ...req.body, institution: req.body.institutionId });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addBatch = async (req, res) => {
  try {
    const batch = await Batch.create(req.body);
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFinance = async (req, res) => {
  try {
    const record = await Finance.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTeacher = async (req, res) => {
  try {
    const inst = await Institution.findById(req.body.institutionId);
    if (!inst) return res.status(404).json({ message: "Institution not found" });
    inst.teachers.push(req.body);
    await inst.save();
    res.status(201).json({ message: "Teacher Added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAchievement = async (req, res) => {
  try {
    const inst = await Institution.findById(req.body.institutionId);
    if (!inst) return res.status(404).json({ message: "Institution not found" });
    inst.achievements.push(req.body);
    await inst.save();
    res.status(201).json({ message: "Achievement Added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === 'notices') await Notice.findByIdAndDelete(id);
    else if (type === 'batches') await Batch.findByIdAndDelete(id);
    else if (type === 'finance') await Finance.findByIdAndDelete(id);
    else if (type === 'teachers') {
        await Institution.updateOne({ "teachers._id": id }, { $pull: { teachers: { _id: id } } });
    }
    else if (type === 'achievements') {
        await Institution.updateOne({ "achievements._id": id }, { $pull: { achievements: { _id: id } } });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.getMyManagedInstitution = async (req, res) => {
  try {
    const inst = await Institution.findOne({ owner: req.user._id });
    if (!inst) return res.json(null);
    res.json(inst);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitClaim = async (req, res) => {
  try {
    const { institutionId, reason, eiinNumber } = req.body;

    const existing = await ClaimRequest.findOne({ institutionId, claimantId: req.user._id, status: 'Pending' });
    if (existing) return res.status(400).json({ message: "You already have a pending claim for this institution." });

    const claim = await ClaimRequest.create({
      institutionId,
      claimantId: req.user._id,
      reason,
      proofDetails: {
        eiinNumber,
        licensePdf: req.files?.license ? req.files.license[0].path : null,
        idCard: req.files?.idCard ? req.files.idCard[0].path : null
      }
    });

    res.status(201).json({ message: "Claim submitted! Admin will review your documents.", claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { action } = req.body;

    const claim = await ClaimRequest.findById(claimId);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    if (action === 'Approve') {
      const inst = await Institution.findByIdAndUpdate(claim.institutionId, {
        owner: claim.claimantId,
        isVerified: true,
        verificationStatus: 'Approved'
      });

      await User.findOneAndUpdate(
        { institution: inst._id, institutionRole: 'Admin' }, 
        { institutionRole: 'Member' }
      );

      await User.findByIdAndUpdate(claim.claimantId, {
        institution: inst._id,
        institutionRole: 'Admin'
      });

      claim.status = 'Approved';
    } else {
      claim.status = 'Rejected';
    }

    await claim.save();
    res.json({ message: `Claim ${action}ed successfully!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.collectStudentFee = async (req, res) => {
  try {
    const { studentId, amount, month, batchId, note } = req.body;
    const instId = req.user.institution;

    const feeRecord = await Finance.create({
      institutionId: instId,
      type: 'Income',
      category: 'Student Fee',
      amount,
      studentId,
      paymentStatus: 'Paid',
      note: `${month} মাসের বেতন - ব্যাচ: ${batchId}. ${note || ''}`,
      addedBy: req.user._id
    });

    res.status(201).json({ message: "Fee collected successfully!", feeRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { amount, category, note } = req.body;
    const expense = await Finance.create({
      institutionId: req.user.institution,
      type: 'Expense',
      category,
      amount,
      paymentStatus: 'Paid',
      note,
      addedBy: req.user._id
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFinanceSummary = async (req, res) => {
  try {
    const instId = req.params.instId;
    const records = await Finance.find({ institutionId: instId });

    const totalIncome = records.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = records.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      history: records.slice(-10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentFeeStatus = async (req, res) => {
  try {
    const myFees = await Finance.find({ 
      studentId: req.user._id, 
      institutionId: req.params.instId 
    }).sort({ createdAt: -1 });

    res.json(myFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.publishResult = async (req, res) => {
  try {
    const { studentId, batchId, examName, marks, comments } = req.body;
    const instId = req.user.institution;

    const totalObtained = marks.reduce((sum, item) => sum + item.obtainedMarks, 0);
    const totalPossible = marks.reduce((sum, item) => sum + item.totalMarks, 0);
    const percentage = (totalObtained / totalPossible) * 100;

    const result = await Result.create({
      studentId,
      institutionId: instId,
      batchId,
      examName,
      marks,
      totalObtained,
      percentage,
      comments,
      publishedBy: req.user._id
    });

    await Notification.create({
      recipient: studentId,
      sender: req.user._id,
      type: 'result_published',
      message: `${examName} এর রেজাল্ট পাবলিশ হয়েছে। তোমার স্কোর: ${percentage.toFixed(2)}%`,
      link: `/dashboard/my-results`
    });

    res.status(201).json({ message: "Result published & Student notified!", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id })
      .populate('institutionId', 'name logo')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBatchResults = async (req, res) => {
  try {
    const { batchId } = req.params;
    const results = await Result.find({ batchId })
      .populate('studentId', 'fullName profilePic')
      .sort({ totalObtained: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createInstitutionPost = async (req, res) => {
  try {
    const { content, postType, visibility, subject, semester } = req.body;
    const instId = req.user.institution;

    if (!instId) return res.status(403).json({ message: "You don't belong to any institution." });

    let mediaUrl = "";
    let fileUrl = "";

    if (req.files) {
      if (req.files.media) mediaUrl = req.files.media[0].path;
      if (req.files.file) fileUrl = req.files.file[0].path;
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      media: mediaUrl,
      file: fileUrl,
      postType: postType || 'Social',
      visibility: visibility || 'campus',
      institution: instId,
      subject,
      semester
    });

    res.status(201).json({ message: "Post published to Campus Feed!", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCampusFeed = async (req, res) => {
  try {
    const instId = req.user.enrolledCampus || req.user.institution;

    if (!instId) return res.status(403).json({ message: "Please join an institution first to see its feed." });

    const posts = await Post.find({ 
      institution: instId,
      visibility: { $in: ['campus', 'global'] }
    })
    .populate('author', 'fullName profilePic institutionRole')
    .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================================
// FIXED: getInstitutionDetails — ObjectId validation + full data return
// =====================================================================
exports.getInstitutionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // ObjectId valid কিনা চেক করা — invalid হলে MongoDB crash করে
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid institution ID" });
    }

    // সম্পূর্ণ institution data fetch করা
    // teachers এবং achievements already embedded array, আলাদা populate লাগবে না
    const institution = await Institution.findById(id).lean();

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.status(200).json(institution);
  } catch (error) {
    console.error("getInstitutionDetails error:", error);
    res.status(500).json({ message: error.message });
  }
};

// নির্দিষ্ট institution-এর notices
exports.getInstitutionNotices = async (req, res) => {
  try {
    const { id } = req.params;
    const notices = await Notice.find({ institution: id }).sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addPersonality = async (req, res) => {
  try {
    const { name, title, quote, category, yearOfGraduation } = req.body;
    const instId = req.user.institution;

    if (!instId) return res.status(403).json({ message: 'Not an institution admin.' });

    // Image comes from file upload (req.files) or URL string fallback
    let image = '';
    if (req.files?.image && req.files.image[0]) {
      image = req.files.image[0].path;
    } else if (req.body.imageUrl) {
      image = req.body.imageUrl;
    }

    const personality = await NotablePersonality.create({
      institution: instId,
      name,
      title: title || '',
      quote,
      category: category || 'Other',
      yearOfGraduation: yearOfGraduation || '',
      image
    });

    res.status(201).json(personality);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Notable Personalities for an institution (Public)
exports.getPersonalities = async (req, res) => {
  try {
    const personalities = await NotablePersonality.find({ institution: req.params.instId })
      .sort({ order: 1, createdAt: -1 });
    res.json(personalities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a personality (Admin only)
exports.deletePersonality = async (req, res) => {
  try {
    await NotablePersonality.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
