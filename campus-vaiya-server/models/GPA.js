const mongoose = require('mongoose');

const gpaSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semesterOrClass: { type: String, required: true },
    gpa: { type: Number, required: true },
    totalCredits: { type: Number, default: 0 },
    subjects: Array, // [{name, grade, credit}]
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GPA', gpaSchema);