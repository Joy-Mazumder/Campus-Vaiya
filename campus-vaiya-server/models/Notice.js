const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);