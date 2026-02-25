const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    fileType: { type: String }, 
    subject: { type: String, required: true },
    semester: { type: String },
    
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' }, 
    
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    isGlobal: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);