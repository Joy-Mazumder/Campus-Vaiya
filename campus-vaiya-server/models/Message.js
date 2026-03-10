const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    text: { 
        type: String,
        default: ""
    },
    image: { 
        type: String, // Cloudinary URL
        default: ""
    },
    pdf: { 
        type: String, // Cloudinary URL
        default: ""
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    isDeleted: {
        type: Boolean,
        default: false // মেসেজ ডিলিট করার জন্য
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);