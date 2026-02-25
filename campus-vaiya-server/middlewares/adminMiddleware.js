const adminProtect = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Only system admins can perform this action." });
    }
};

module.exports = { adminProtect };