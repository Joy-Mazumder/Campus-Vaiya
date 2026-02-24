const User = require('../models/User');
const Institution = require('../models/Institution');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registration Logic
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, instId, referralID, studentClass } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        let finalInstId = null;

        // If user selects an institution
        if (instId) {
            const inst = await Institution.findById(instId);
            if (!inst || inst.status !== 'approved') {
                return res.status(400).json({ message: "Institution not found or not approved." });
            }

            // Referral ID check logic
            if (inst.isReferralRequired) {
                if (inst.referralID !== referralID) {
                    return res.status(400).json({ message: "Invalid Referral ID for this institution." });
                }
            }
            finalInstId = inst._id;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            universityId: finalInstId,
            studentClass
        });

        res.status(201).json({
            message: "Registration successful",
            user: { id: user._id, name: user.fullName, email: user.email }
        });

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