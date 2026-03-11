const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ১. প্রটেক্ট মিডলওয়্যার
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ইউজার ডেটা ফেচ করা এবং ইন্সটিটিউশন পপুলেট করা
    req.user = await User.findById(decoded.id).populate('institution');
    
    if (!req.user) {
        return res.status(401).json({ message: "User not found" });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

// ২. ইন্সটিটিউশন এডমিন মিডলওয়্যার
const instAdminProtect = (req, res, next) => {
  // req.user আসে protect মিডলওয়্যার থেকে
  if (req.user && req.user.institutionRole === 'Admin') {
    next();
  } else {
    res.status(403).json({ 
      message: "Access denied. Only Institution Admins can perform this action." 
    });
  }
};

// ৩. সঠিকভাবে এক্সপোর্ট করা
module.exports = { protect, instAdminProtect };