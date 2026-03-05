const mongoose = require('mongoose'); // ১. এটি এড করতে হবে

const helpRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  description: String,
  images: [String],
  targetRank: Number, 
  category: String, 
  status: { type: String, enum: ['Open', 'Solved'], default: 'Open' },
  solutions: [{
    solver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answer: String,
    upvotes: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema); // ২. এটি এড করতে হবে