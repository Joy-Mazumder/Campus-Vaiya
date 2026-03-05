const User = require('../models/User');
const Friendship = require('../models/Friendship');
const Notification = require('../models/Notification');

// ১. connect request
exports.sendConnectRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        if (req.user.id === recipientId) return res.status(400).json({ message: "You can't connect with yourself" });

        // check if there's already a pending request or they are already friends
        const existing = await Friendship.findOne({
            $or: [
                { requester: req.user.id, recipient: recipientId },
                { requester: recipientId, recipient: req.user.id }
            ]
        });

        if (existing) return res.status(400).json({ message: "Request already pending or you are already friends" });

        const request = await Friendship.create({ requester: req.user.id, recipient: recipientId });

        // create notification for the recipient
        await Notification.create({
            recipient: recipientId,
            sender: req.user.id,
            type: 'friend_request',
            message: `${req.user.fullName} wants to connect with you.`
        });

        res.status(201).json({ message: "Connection request sent!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// accept request
exports.acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await Friendship.findById(requestId);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = 'accepted';
        await request.save();

        // update both users' friend lists
        await User.findByIdAndUpdate(request.requester, { $push: { friends: request.recipient } });
        await User.findByIdAndUpdate(request.recipient, { $push: { friends: request.requester } });

        // points increment for accepting a friend request
        await User.findByIdAndUpdate(request.recipient, { $inc: { reputationPoints: 1 } });

        await Notification.create({
            recipient: request.requester,
            sender: req.user.id,
            type: 'accept_request',
            message: `${req.user.fullName} accepted your connection request.`
        });

        res.json({ message: "Connection established!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};