const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  established: { type: String, default: '' },
  subcategories: [subcategorySchema],
}, { timestamps: true });

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  type: { type: String, enum: ['School', 'College', 'University', 'Coaching'], required: true },
  
  // Branding & UI
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

  // Verification & Access
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Claimed'], 
    default: 'Pending' 
  },
  verificationDetails: {
    eiinNumber: { type: String },
    licensePdf: { type: String },
    ownerIdCard: { type: String }
  },

  isRestricted: { type: Boolean, default: false },
  referralCode: { type: String, unique: true },

  // Faculty/Teacher Management
  teachers: [{
    name: { type: String, required: true },
    designation: String,
    department: String,
    image: String,
    email: String,
    phone: String,
    isUser: { type: Boolean, default: false }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Academic Structure — upgraded from [String] to rich schema
  departments: [departmentSchema],

  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }], 
  history: { type: String, default: '' },
  alumniHistory: { type: String, default: '' },
  admissionInfo: { type: String, default: '' },
  foundedYear: { type: String, default: '' },
  studentLife: { type: String, default: '' },
  research: { type: String, default: '' },

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
