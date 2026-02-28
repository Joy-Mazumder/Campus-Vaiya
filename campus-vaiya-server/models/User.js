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
    createdAt: { type: Date, default: Date.now },
    institutionType: { type: String, enum: ['School', 'College', 'University', 'Coaching', 'None'] },
    currentClassOrSemester: { type: String }, // যেমন: 'Class 9', 'Inter 1st', '3rd Sem'
    customInstitutionName: { type: String }, 
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    results: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Result' }],
    cgpaHistory: [{
      semesterOrClass: String,
      gpa: Number,
      totalCredits: Number,
      subjects: Array
    }],
    reputationPoints: { type: Number, default: 0 },
    contributionCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);