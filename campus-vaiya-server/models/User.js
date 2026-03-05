const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePic: { type: String },
  
  // Education Metadata
  educationLevel: { 
    type: String, 
    enum: ['School', 'College', 'University', 'Masters', 'PhD'], 
    required: true 
  },
  currentClass: { type: Number, required: true }, // 1-10 (School), 11-12 (College), 13-16 (Uni)
  rank: { type: Number }, // Calculated for Senior-Junior mapping
  lastClassUpdate: { type: Date, default: Date.now },

  // Institution Connection
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  institutionRole: { type: String, enum: ['Student', 'Teacher', 'Admin', 'Guest'], default: 'Guest' },
  studentId: { type: String }, // For result management
  isApproved: { type: Boolean, default: false }, // Referral approval check

  // Senior Help & Reputation
  reputationPoints: { type: Number, default: 0 },
  badge: { type: String, default: 'Freshman' },
  specialities: [String], // Subjects they are good at
  helpSettings: {
    available: { type: Boolean, default: true },
    preferredSubjects: [String],
    preferredClasses: [Number]
  },

  // Social
  bio: { type: String, maxlength: 160 },
  careerGoal: { type: String },
  targetCGPA: { type: Number, default: 3.5 },
  totalSemesters: { type: Number, default: 8 },
  skills: [String],
  socialLinks: {
    github: String,
    linkedin: String,
    facebook: String
  },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);