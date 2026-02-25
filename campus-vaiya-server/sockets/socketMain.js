const HelpRequest = require('../models/HelpRequest');

const socketMain = (io) => {
    io.on('connection', (socket) => {
        console.log('⚡ A user connected:', socket.id);

        
        socket.on('join_university_room', (universityId) => {
            socket.join(universityId);
            console.log(`User joined room: ${universityId}`);
        });

        
        socket.on('send_help_request', (data) => {
            socket.to(data.universityId).emit('new_help_notification', data);
        });

        socket.on('accept_request', async ({ requestId, seniorId }) => {
            const request = await HelpRequest.findByIdAndUpdate(requestId, {
                status: 'accepted',
                acceptedBy: seniorId
            }, { new: true });

            socket.join(requestId);
            io.to(requestId).emit('request_accepted', request);
        });

        socket.on('send_message', (data) => {
            io.to(data.requestId).emit('receive_message', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

module.exports = socketMain;