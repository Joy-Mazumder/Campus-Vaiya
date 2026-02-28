const User = require('../models/User');
const Institution = require('../models/Institution');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registration Logic
// controllers/authController.js

// controllers/authController.js

exports.register = async (req, res) => {
    try {
        const { 
            fullName, email, password, role, 
            institutionType, currentClassOrSemester, 
            instId, customInstitutionName, referralID 
        } = req.body;

        // ১. অথরিটি হিসেবে রেজিস্টার করলে নতুন প্রতিষ্ঠান পেন্ডিং মোডে তৈরি হবে
        let finalInstId = instId || null;
        
        if (role === 'inst_admin' && !instId) {
            // নতুন প্রতিষ্ঠান তৈরির রিকোয়েস্ট (SaaS Model)
            const newInst = await Institution.create({
                name: customInstitutionName,
                type: institutionType,
                adminEmail: email,
                status: 'pending' // এডমিন এপ্রুভ করলে সে তার প্রতিষ্ঠানের ফুল এক্সেস পাবে
            });
            finalInstId = newInst._id;
        }

        // ২. স্টুডেন্ট যদি কাস্টম স্কুলের নাম দেয়
        if (role === 'student' && !instId && customInstitutionName) {
            // এখানে আমরা শুধু নামটা সেভ রাখব, পরে সাজেশনে দেখানোর জন্য
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role: role || 'student',
            institutionType,
            currentClassOrSemester,
            universityId: finalInstId,
            customInstitutionName
        });

        res.status(201).json({ message: "Account created successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
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