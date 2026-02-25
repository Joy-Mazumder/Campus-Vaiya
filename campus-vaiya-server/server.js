const http = require('http');
const { Server } = require('socket.io');
const socketMain = require('./sockets/socketMain');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const instRoutes = require('./routes/instRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

const app = express();

const server = http.createServer(app); // HTTP Server 
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});
socketMain(io); // Socket.IO Logic

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/institution', instRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/tools', require('./routes/toolRoutes'));

app.get('/', (req, res) => {
    res.send('CampusVaiya API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));