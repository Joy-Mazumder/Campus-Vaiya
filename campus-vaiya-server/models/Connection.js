const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    requester: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

// একই ইউজার যেন বারবার রিকোয়েস্ট পাঠাতে না পারে তার জন্য ইনডেক্সিং
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);