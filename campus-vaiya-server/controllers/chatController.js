const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

exports.toggleAvailability = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.isAvailableForHelp = !user.isAvailableForHelp;
        await user.save();
        res.json({ isAvailable: user.isAvailableForHelp });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createHelpRequest = async (req, res) => {
    try {
        const { topic, description } = req.body;
        const newRequest = await HelpRequest.create({
            sender: req.user.id,
            universityId: req.user.universityId,
            topic,
            description
        });
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};