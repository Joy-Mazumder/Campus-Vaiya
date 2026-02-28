const Institution = require('../models/Institution');
const Notice = require('../models/Notice');

const Result = require('../models/Result');
const User = require('../models/User');

// ১. রেজাল্ট পাবলিশ করা (Authority Only)
exports.publishResult = async (req, res) => {
    try {
        const { studentEmail, batch, examName, subjects, totalGPA } = req.body;
        
        // স্টুডেন্টকে খুঁজে বের করা
        const student = await User.findOne({ email: studentEmail });
        if (!student) return res.status(404).json({ message: "Student not found with this email" });

        // রেজাল্ট তৈরি
        const result = await Result.create({
            institution: req.user.universityId,
            student: student._id,
            batch,
            examName,
            subjects,
            totalGPA,
            publishedBy: req.user.id
        });

        // স্টুডেন্টের মডেলে রেজাল্ট আইডি পুশ করা
        student.results.push(result._id);
        await student.save();

        res.status(201).json({ message: "Result published successfully!", result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ২. স্টুডেন্টের নিজের রেজাল্ট দেখা
exports.getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user.id })
            .populate('institution', 'name logo')
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createNotice = async (req, res) => {
    try {
        const { title, content } = req.body;
        const notice = await Notice.create({
            title,
            content,
            universityId: req.user.universityId,
            postedBy: req.user.id
        });
        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.find({ universityId: req.user.universityId }).sort({ date: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.requestInstitution = async (req, res) => {
    try {
        const { name, location, adminEmail, isReferralRequired } = req.body;
        
        const newInst = await Institution.create({
            name,
            location,
            adminEmail,
            isReferralRequired,
            status: 'pending'
        });

        res.status(201).json({ message: "Application submitted. Wait for admin approval.", data: newInst });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getApprovedInstitutions = async (req, res) => {
    try {
        const institutions = await Institution.find({ status: 'approved' }).select('name _id isReferralRequired');
        res.json(institutions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};