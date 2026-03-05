const mongoose = require('mongoose');

const gpaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semesterOrClass: { type: String, required: true }, // e.g., "3rd Semester"
  gpa: { type: Number, required: true },
  totalCredits: { type: Number, required: true },
  subjects: [{
    name: String,
    credit: Number,
    grade: String,
    gradePoint: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('GPA', gpaSchema);