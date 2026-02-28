const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    batch: { type: String, required: true }, // e.g., 'Batch 2024'
    examName: { type: String, required: true }, // e.g., 'Term Final'
    subjects: [
        {
            name: String,
            marks: Number,
            grade: String,
            point: Number
        }
    ],
    totalGPA: { type: Number },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Authority ID
    isSharedToFeed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);