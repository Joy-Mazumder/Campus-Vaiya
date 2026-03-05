const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  name: { type: String, required: true }, // e.g., "SSC 2025" or "Batch A"
  year: { type: String }, // e.g., "2024"
  section: { type: String }, // e.g., "Science", "Morning Shift"
  class: { type: Number, required: true }, // The rank/class of this batch
  
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subjects: [String],
  routine: [{
    day: String,
    time: String,
    subject: String,
    teacher: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);