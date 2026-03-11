const Connection = require('../models/Connection');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// --- CONNECTION LOGIC (Friend Requests) ---

// ১. ফ্রেন্ড রিকোয়েস্ট পাঠানো
exports.sendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const requesterId = req.user._id;

        if (requesterId.toString() === recipientId) {
            return res.status(400).json({ message: "You cannot send a request to yourself" });
        }

        const existing = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existing) return res.status(400).json({ message: "Connection already exists or pending" });

        const newConn = await Connection.create({ requester: requesterId, recipient: recipientId });
        res.status(201).json({ message: "Request sent successfully", data: newConn });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ২. ফ্রেন্ড রিকোয়েস্ট এক্সেপ্ট করা
exports.acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const connection = await Connection.findById(requestId);

        if (!connection || connection.status !== 'pending') {
            return res.status(404).json({ message: "Invalid request" });
        }

        connection.status = 'accepted';
        await connection.save();

        const participants = [connection.requester, connection.recipient];
        let conversation = await Conversation.findOne({
            participants: { $all: participants }
        });

        if (!conversation) {
            conversation = await Conversation.create({ participants });
        }

        res.status(200).json({ message: "Request accepted", conversationId: conversation._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ৩. রিকোয়েস্ট রিজেক্ট করা বা ফ্রেন্ড রিমুভ করা
exports.deleteConnection = async (req, res) => {
    try {
        const { connectionId } = req.params;
        await Connection.findByIdAndDelete(connectionId);
        res.json({ message: "Connection removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ৪. সব কানেকশন লিস্ট (Pending/Accepted/Sent)
exports.getMyConnections = async (req, res) => {
    try {
        const userId = req.user._id;
        const connections = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }]
        }).populate('requester recipient', 'fullName profilePic reputationPoints institution rank');
        res.json(connections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- CHAT LOGIC ---

// ৫. মেসেজ পাঠানো (Text, Image, PDF)
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const senderId = req.user._id;

        let imageUrl = "";
        let pdfUrl = "";

        // Multer থেকে আসা ফাইল চেক (Cloudinary URL)
        if (req.files) {
            if (req.files.image) imageUrl = req.files.image[0].path;
            if (req.files.pdf) pdfUrl = req.files.pdf[0].path;
        }

        const newMessage = await Message.create({
            conversationId,
            sender: senderId,
            text,
            image: imageUrl,
            pdf: pdfUrl
        });

        // কনভারসেশনে লাস্ট মেসেজ আপডেট করা
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text || (imageUrl ? "Sent an image" : "Sent a PDF"),
            lastMessageTime: Date.now(),
            lastSender: senderId
        });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ৬. চ্যাট লিস্ট গেট করা
// চ্যাট লিস্ট গেট করা (লাস্ট মেসেজ এবং অন্য ইউজারের ডাটা সহ)
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const conversations = await Conversation.find({
            participants: { $in: [userId] }
        })
        .populate({
            path: 'participants',
            select: 'fullName profilePic rank institution' 
        })
        .sort({ lastMessageTime: -1 });

        // জাস্ট অন্য ইউজারের ডাটা আলাদা করে পাঠানো (Frontend-এ সুবিধা হবে)
        const formattedConversations = conversations.map(conv => {
            const otherUser = conv.participants.find(p => p._id.toString() !== userId.toString());
            return {
                ...conv._doc,
                otherUser
            };
        });

        res.json(formattedConversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ৭. নির্দিষ্ট মেসেজ হিস্ট্রি
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ৮. ফুল কনভারসেশন ডিলিট (Database থেকে মুছে ফেলা)
exports.deleteFullConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        // ১. ওই কনভারসেশনের সব মেসেজ ডিলিট
        await Message.deleteMany({ conversationId });
        
        // ২. কনভারসেশন অবজেক্ট ডিলিট
        await Conversation.findByIdAndDelete(conversationId);
        
        res.json({ message: "Entire conversation deleted from database" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ৯. মেসেজ আনসেন্ড (isDeleted: true)
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message || message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        message.isDeleted = true;
        message.text = "Message un-sent";
        message.image = "";
        message.pdf = "";
        await message.save();

        res.json({ message: "Message un-sent" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};