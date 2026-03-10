// server.js (Sync and Optimized)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const toolRoutes = require('./routes/toolRoutes');
const instRoutes = require('./routes/instRoutes');
const userRoutes = require('./routes/userRoutes');
const socialRoutes = require('./routes/socialRoutes');
const commentRoutes = require('./routes/commentRoutes');
const helpRoutes = require('./routes/helpRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Models
const User = require('./models/User'); 
const HelpRequest = require('./models/HelpRequest');

const app = express();
const server = http.createServer(app);

// Socket.io Setup with .env FRONTEND_URL
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Database Connection
connectDB();

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tools', toolRoutes); 
app.use('/api/institution', instRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/help', helpRoutes); 
app.use('/api/messages', messageRoutes); // Properly integrated

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🛑 Server Error:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

const testCloudinary = async () => {
  try {
    const result = await cloudinary.uploader.upload("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png");
    console.log("✅ Cloudinary logic is perfect! URL:", result.secure_url);
  } catch (err) {
    console.log("❌ Cloudinary Credential Error:", err.message);
  }
};
testCloudinary();
// Real-time Chat Logic
let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('⚡ User Connected:', socket.id);

  socket.on('addUser', (userId) => {
    if(userId) {
        onlineUsers.set(userId, socket.id);
        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('sendMessage', ({ senderId, receiverId, text, image, pdf, conversationId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', {
        senderId,
        text,
        image,
        pdf,
        conversationId,
        createdAt: new Date()
      });
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    console.log('❌ User Disconnected');
  });
});

// Cron Job (Help Request Expiry)
cron.schedule('0 * * * *', async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const expiredRequests = await HelpRequest.find({
    status: 'Accepted',
    acceptedAt: { $lt: twentyFourHoursAgo }
  });

  for (let request of expiredRequests) {
    const penaltyUser = request.acceptedBy;
    request.status = 'Open';
    request.acceptedBy = null;
    await request.save();
    if (penaltyUser) {
        await User.findByIdAndUpdate(penaltyUser, { $inc: { reputationPoints: -10 } });
    }
  }
});

app.get('/', (req, res) => res.send('CampusVaiya API is running...'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
