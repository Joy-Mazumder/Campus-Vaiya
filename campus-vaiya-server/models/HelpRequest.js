const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: { type: String, required: true }, 
  topic: { type: String }, // নতুন যোগ করা হয়েছে
  description: { type: String, required: true },
  images: [{ type: String }], // Cloudinary বা অন্য URL
  pdf: { type: String }, // PDF সাপোর্ট
  
  senderRank: { type: Number, required: true }, 
  targetRankMin: { type: Number, required: true }, 
  
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  status: { type: String, enum: ['Open', 'Accepted', 'Solved', 'Expired'], default: 'Open' },
  
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptedAt: { type: Date }, // ২৪ ঘণ্টা ট্র্যাক করার জন্য
  
  solution: {
    text: String,
    image: String, // সলিউশনে ইমেজ সাপোর্ট
    solvedAt: Date,
    votes: {
      up: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      down: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);