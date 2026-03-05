const mongoose = require('mongoose');
const noticeSchema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  title: { type: String, required: true },
  content: String,
  category: { type: String, enum: ['Exam', 'Holiday', 'Event', 'General'], default: 'General' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('Notice', noticeSchema);