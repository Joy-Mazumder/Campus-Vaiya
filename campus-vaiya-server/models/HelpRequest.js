const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true }, // Added
  description: { type: String, required: true },
  category: { type: String, required: true },
  images: [{ type: String }], 
  pdf: { type: String }, // Added
  
  senderRank: { type: Number, required: true },
  targetRankMin: { type: Number, required: true },
  
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  status: { type: String, enum: ['Open', 'Accepted', 'Solved'], default: 'Open' },
  
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptedAt: { type: Date }, // Added for 24h logic
  declinedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  solution: {
    text: String,
    image: String, // Added for solution image
    solvedAt: Date, // Added
    votes: {
      up: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      down: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);