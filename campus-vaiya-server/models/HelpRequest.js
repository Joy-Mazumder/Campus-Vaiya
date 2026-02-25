const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    topic: { type: String, required: true },
    description: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'completed'], 
        default: 'pending' 
    },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);