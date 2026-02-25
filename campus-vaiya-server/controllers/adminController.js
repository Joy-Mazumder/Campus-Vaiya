const Institution = require('../models/Institution');
const crypto = require('crypto');

exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await Institution.find({ status: 'pending' });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.approveInstitution = async (req, res) => {
    try {
        const { id } = req.params;
        
        
        const referralID = "CV-" + crypto.randomBytes(2).toString('hex').toUpperCase();

        const updatedInst = await Institution.findByIdAndUpdate(
            id, 
            { status: 'approved', referralID: referralID },
            { new: true }
        );

        res.json({ message: "Institution Approved!", referralID: updatedInst.referralID });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};