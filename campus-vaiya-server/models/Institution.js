const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true }, // e.g., 'du-cse'
  type: { type: String, enum: ['School', 'College', 'University', 'Coaching'], required: true },
  
  // Branding & UI (For the official website look)
  logo: { type: String },
  banner: { type: String },
  themeColor: { type: String, default: '#2563eb' },
  vision: { type: String },
  mission: { type: String },
  achievements: [{ 
    title: String, 
    year: String, 
    description: String,
    image: String 
  }],

  // --- NEW: Verification & Access ---
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false }, // আগের কোড ব্রেক না করার জন্য রাখা হলো
  verificationStatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Claimed'], 
    default: 'Pending' 
  },
  verificationDetails: {
    eiinNumber: { type: String },     // School, College, University এর জন্য
    licensePdf: { type: String },     // School, College, University এর জন্য
    ownerIdCard: { type: String }     // Coaching এর জন্য
  },

  isRestricted: { type: Boolean, default: false }, // referral code lagbe ki na
  referralCode: { type: String, unique: true },

  // Faculty/Teacher Management
  teachers: [{
    name: { type: String, required: true },
    designation: String, // e.g., Lecturer, Headmaster
    department: String,
    image: String,
    email: String,
    phone: String,
    isUser: { type: Boolean, default: false }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Academic Structure
  departments: [String], 
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }], 

  // Official Contact
  contact: {
    email: String,
    phone: String,
    address: String,
    mapLocation: String
  },

  // Financial Configuration
  billing: {
    monthlySubscription: { type: Boolean, default: false }, 
    studentFeeTracking: { type: Boolean, default: true }
  },

  socialLinks: {
    facebook: String,
    linkedin: String,
    youtube: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Institution', institutionSchema);