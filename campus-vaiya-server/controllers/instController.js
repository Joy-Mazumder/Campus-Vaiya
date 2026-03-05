const Institution = require('../models/Institution');
const User = require('../models/User');
const Notice = require('../models/Notice');
const Batch = require('../models/Batch');
const Finance = require('../models/Finance');

exports.createInstitution = async (req, res) => {
  try {
    const { name, type, referralCode, isRestricted, themeColor, contact } = req.body;

    // ১. চেক করা এই নামে বা স্লাগে অলরেডি আছে কি না
    const slug = name.toLowerCase().split(' ').join('-');
    const existingInst = await Institution.findOne({ slug });
    if (existingInst) return res.status(400).json({ message: "Institution name already taken. Try a unique one." });

    // ২. নতুন ইন্সটিটিউশন তৈরি (req.user.id আসবে authMiddleware থেকে)
    const institution = await Institution.create({
      name,
      slug,
      type,
      owner: req.user._id,
      referralCode: referralCode || `CV-${Math.floor(1000 + Math.random() * 9000)}`,
      isRestricted,
      themeColor: themeColor || '#2563eb',
      contact,
      isVerified: true // যেহেতু ওনার নিজে ক্রিয়েট করছে
    });

    // ৩. ইউজারের রোল আপডেট করা (সে এখন এই প্রতিষ্ঠানের Admin)
    await User.findByIdAndUpdate(req.user._id, {
      institution: institution._id,
      institutionRole: 'Admin'
    });

    res.status(201).json({
      message: "Institution Space Created Successfully!",
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