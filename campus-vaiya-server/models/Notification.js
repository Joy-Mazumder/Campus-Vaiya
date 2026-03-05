const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { 
        type: String, 
        enum: ['friend_request', 'accept_request', 'result_published', 'help_accepted'], 
        required: true 
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);