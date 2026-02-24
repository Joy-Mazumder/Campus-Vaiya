const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    logo: { type: String, default: "" },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    referralID: { type: String, unique: true, sparse: true },
    isReferralRequired: { type: Boolean, default: false }, 
    
    adminEmail: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institution', institutionSchema);