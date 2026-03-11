const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  examName: { type: String, required: true }, // e.g., "Monthly Test - Jan", "Final Exam"
  
  marks: [{
    subject: { type: String, required: true },
    obtainedMarks: { type: Number, required: true },
    totalMarks: { type: Number, default: 100 },
    grade: String
  }],
  
  totalObtained: { type: Number },
  percentage: { type: Number },
  status: { type: String, enum: ['Pass', 'Fail'], default: 'Pass' },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin/Teacher
  comments: String
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);