const Institution = require('../models/Institution');
const Notice = require('../models/Notice');


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