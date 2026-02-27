const User = require('../models/User');
const Institution = require('../models/Institution');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registration Logic
// controllers/authController.js

exports.register = async (req, res) => {
    try {
        const { fullName, email, password, instId, referralID, studentClass } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists with this email." });

        let finalInstId = null;

        // শুধু তখনই চেক করবে যদি instId থাকে এবং সেটি খালি না হয়
        if (instId && instId !== "") { 
            const inst = await Institution.findById(instId);
            
            // চেক করো স্কুলটি এপ্রুভড কি না
            if (!inst || inst.status !== 'approved') {
                return res.status(400).json({ message: "Institution not found or not approved by admin." });
            }

            // Referral ID লজিক
            if (inst.isReferralRequired) {
                if (inst.referralID !== referralID) {
                    return res.status(400).json({ message: "Invalid Referral ID. Please contact your school." });
                }
            }
            finalInstId = inst._id;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            universityId: finalInstId,
            studentClass
        });

        res.status(201).json({ message: "Registration successful" });

    } catch (error) {
        console.log("Register Error:", error); // ব্যাকএন্ড কনসোলে এরর দেখার জন্য
        res.status(500).json({ message: "Internal Server Error. Try again later." });
    }
};

// Login Logic
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('universityId');

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                university: user.universityId, // Includes institution details
                token
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};