const Institution = require('../models/Institution');
const User = require('../models/User');
const Notice = require('../models/Notice');
const Batch = require('../models/Batch');
const Post = require('../models/Post');
const Finance = require('../models/Finance');
const ClaimRequest = require('../models/ClaimRequest');


exports.createInstitution = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      referralCode, 
      isRestricted, 
      themeColor, 
      contact, 
      eiinNumber // ফ্রন্টএন্ড থেকে আসবে
    } = req.body;

    // ১. কোচিং সেন্টারের নামের সীমাবদ্ধতা চেক করা
    if (type === 'Coaching') {
      const forbiddenWords = ['school', 'college', 'university', 'varsity', 'uni'];
      const lowerName = name.toLowerCase();
      const isInvalid = forbiddenWords.some(word => lowerName.includes(word));
      
      if (isInvalid) {
        return res.status(400).json({ 
          message: "Coaching centers cannot include 'School', 'College', or 'University' in their name." 
        });
      }
    }

    // ২. ইউনিক স্লাগ (Slug) তৈরি করা
    const slug = name.toLowerCase().split(' ').join('-') + '-' + Math.floor(100 + Math.random() * 900);
    
    // ৩. ভেরিফিকেশন ফাইল হ্যান্ডেল করা (Multer ব্যবহার করলে)
    const verificationDetails = {};
    if (type === 'Coaching') {
      verificationDetails.ownerIdCard = req.files?.idCard ? req.files.idCard[0].path : null;
    } else {
      verificationDetails.eiinNumber = eiinNumber;
      verificationDetails.licensePdf = req.files?.license ? req.files.license[0].path : null;
    }

    // ৪. নতুন ইন্সটিটিউশন তৈরি
    const institution = await Institution.create({
      name,
      slug,
      type,
      owner: req.user._id,
      referralCode: referralCode || `CV-${Math.floor(1000 + Math.random() * 9000)}`,
      isRestricted,
      themeColor: themeColor || '#2563eb',
      contact,
      verificationStatus: 'Pending', // অ্যাডমিন চেক করার আগে পেন্ডিং থাকবে
      verificationDetails,
      isVerified: false // শুরুতে ফলস থাকবে
    });

    // ৫. ইউজারের রোল আপডেট (Admin হিসেবে সেট করা)
    await User.findByIdAndUpdate(req.user._id, {
      institution: institution._id,
      institutionRole: 'Admin'
    });

    res.status(201).json({
      message: "Institution request submitted successfully! Pending verification.",
      institution
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// প্রতিষ্ঠানের নাম সার্চ করার জন্য (Suggestions)
exports.searchInstitutions = async (req, res) => {
  try {
    let { q, type } = req.query;
    if (!q) return res.json([]);

    // ১. সার্চ টার্ম থেকে অতিরিক্ত স্পেস রিমুভ করা
    const searchTerm = q.trim();

    // ২. শক্তিশালী সার্চ প্যাটার্ন তৈরি (এটি শব্দের ক্রমানুসারে না থাকলেও খুঁজে পাবে)
    // উদাহরণ: "Dhaka University" সার্চ করলে "University of Dhaka" ও খুঁজে পেতে পারে
    const words = searchTerm.split(/\s+/).map(word => `(?=.*${word})`).join("");
    const regex = new RegExp(words, 'i'); // 'i' ছোট-বড় হাতের অক্ষরের পার্থক্য দূর করে

    const institutions = await Institution.find({
      type: type,
      $or: [
        { name: { $regex: regex } },
        { slug: { $regex: searchTerm, $options: 'i' } } // স্লাগের সাথেও চেক করবে
      ]
    })
    .limit(8) // ইউজারের সুবিধার জন্য ৫ এর বদলে ৮টি সাজেশন
    .select('name slug logo');

    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ১. প্রতিষ্ঠানের ব্যানার ও লোগো আপডেট
exports.updateInstitutionBranding = async (req, res) => {
  try {
    const { themeColor, vision, mission } = req.body;
    const updateData = { themeColor, vision, mission };

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



// --- GET DATA ---
exports.getNotices = async (req, res) => {
  const notices = await Notice.find({ institution: req.params.instId }).sort({ createdAt: -1 });
  res.json(notices);
};

exports.getBatches = async (req, res) => {
  const batches = await Batch.find({ institutionId: req.params.instId });
  res.json(batches);
};

exports.getFinance = async (req, res) => {
  const finances = await Finance.find({ institutionId: req.params.instId }).sort({ date: -1 });
  res.json(finances);
};

// --- ADD DATA (POST) ---
exports.createNotice = async (req, res) => {
  const notice = await Notice.create({ ...req.body, institution: req.body.institutionId });
  res.status(201).json(notice);
};

exports.addBatch = async (req, res) => {
  const batch = await Batch.create(req.body);
  res.status(201).json(batch);
};

exports.addFinance = async (req, res) => {
  const record = await Finance.create(req.body);
  res.status(201).json(record);
};

// Institution মডেলের ভেতর array-তে ডাটা পুশ করা (Teacher & Achievement)
exports.addTeacher = async (req, res) => {
  const inst = await Institution.findById(req.body.institutionId);
  inst.teachers.push(req.body);
  await inst.save();
  res.status(201).json({ message: "Teacher Added" });
};

exports.addAchievement = async (req, res) => {
  const inst = await Institution.findById(req.body.institutionId);
  inst.achievements.push(req.body);
  await inst.save();
  res.status(201).json({ message: "Achievement Added" });
};

// --- DELETE DATA ---
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
    const inst = await Institution.findOne({ owner: req.user._id })
      .populate('teachers')
      .populate('achievements');
    if (!inst) return res.json(null);
    res.json(inst);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitClaim = async (req, res) => {
  try {
    const { institutionId, reason, eiinNumber } = req.body;

    // আগে থেকেই পেন্ডিং কোনো রিকোয়েস্ট আছে কি না চেক করা
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

// এডমিন যখন ক্লেইমটি অ্যাপ্রুভ করবে
exports.approveClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { action } = req.body; // 'Approve' or 'Reject'

    const claim = await ClaimRequest.findById(claimId);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    if (action === 'Approve') {
      // ১. ইন্সটিটিউশনের ওনার পরিবর্তন করা
      const inst = await Institution.findByIdAndUpdate(claim.institutionId, {
        owner: claim.claimantId,
        isVerified: true,
        verificationStatus: 'Approved'
      });

      // ২. আগের ওনারের রোল রিসেট করা (ঐচ্ছিক কিন্তু নিরাপদ)
      await User.findOneAndUpdate(
        { institution: inst._id, institutionRole: 'Admin' }, 
        { institutionRole: 'Member' } // আগের এডমিন এখন সাধারণ মেম্বার
      );

      // ৩. নতুন ওনারের প্রোফাইলে এই ইন্সটিটিউশন সেট করা
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

// স্টুডেন্টের ফি রেকর্ড করা
exports.collectStudentFee = async (req, res) => {
  try {
    const { studentId, amount, month, batchId, note } = req.body;
    const instId = req.user.institution; // এডমিনের নিজস্ব ইন্সটিটিউশন

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

// প্রতিষ্ঠানের খরচ রেকর্ড করা (Salary, Rent, etc.)
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

// ফিনান্সিয়াল সামারি (Dashboard এর জন্য)
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
      history: records.slice(-10) // শেষ ১০টি ট্রানজেকশন
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// স্টুডেন্ট নিজের ফি এর অবস্থা দেখবে
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

const Result = require('../models/Result');
const Notification = require('../models/Notification');

// ১. রেজাল্ট পাবলিশ করা (Admin/Teacher Only)
exports.publishResult = async (req, res) => {
  try {
    const { studentId, batchId, examName, marks, comments } = req.body;
    const instId = req.user.institution;

    // Total marks calculation
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

    // ২. স্টুডেন্টকে নোটিফিকেশন পাঠানো
    await Notification.create({
      recipient: studentId,
      sender: req.user._id,
      type: 'result_published',
      message: `${examName} এর রেজাল্ট পাবলিশ হয়েছে। তোমার স্কোর: ${percentage.toFixed(2)}%`,
      link: `/dashboard/my-results` // Student dashboard link
    });

    res.status(201).json({ message: "Result published & Student notified!", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৩. স্টুডেন্ট তার নিজের রেজাল্ট দেখবে (Personal Dashboard View)
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

// ৪. ব্যাচ ভিত্তিক রেজাল্ট দেখা (Admin/Institutional View)
exports.getBatchResults = async (req, res) => {
  try {
    const { batchId } = req.params;
    const results = await Result.find({ batchId })
      .populate('studentId', 'fullName profilePic')
      .sort({ totalObtained: -1 }); // Rank wise sorting
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createInstitutionPost = async (req, res) => {
  try {
    const { content, postType, visibility, subject, semester } = req.body;
    const instId = req.user.institution; // যে এডমিন পোস্ট করছে তার ইন্সটিটিউশন

    if (!instId) return res.status(403).json({ message: "You don't belong to any institution." });

    let mediaUrl = "";
    let fileUrl = "";

    // Multer থেকে ফাইল হ্যান্ডেলিং
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
      visibility: visibility || 'campus', // ডিফল্টভাবে ক্যাম্পাসের জন্য
      institution: instId,
      subject,
      semester
    });

    res.status(201).json({ message: "Post published to Campus Feed!", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. স্টুডেন্ট কর্তৃক তার নিজের ক্যাম্পাসের ফিড দেখা
exports.getCampusFeed = async (req, res) => {
  try {
    const instId = req.user.institution; // স্টুডেন্টের ইন্সটিটিউশন

    if (!instId) return res.status(403).json({ message: "Please join an institution first to see its feed." });

    // শুধু সেই ইন্সটিটিউশনের পোস্ট এবং যেগুলো 'campus' বা 'global' ভিজিবিলিটি আছে
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