const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['student', 'senior', 'admin', 'inst_admin'], 
        default: 'student' 
    },
    studentClass: { type: String }, 
    
    universityId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Institution', 
        default: null 
    },
    
    badge: { type: String, default: 'Newbie' },
    isAvailableForHelp: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);