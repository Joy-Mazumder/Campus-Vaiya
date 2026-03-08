require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const toolRoutes = require('./routes/toolRoutes');
const instRoutes = require('./routes/instRoutes');
const userRoutes = require('./routes/userRoutes');
const socialRoutes = require('./routes/socialRoutes');
const commentRoutes = require('./routes/commentRoutes');
// আপনার cloudinary কনফিগ ফাইল থেকে ইমপোর্ট করুন
const { cloudinary } = require('./config/cloudinary');
const cron = require('node-cron');
const HelpRequest = require('./models/HelpRequest');
const app = express();

// Database Connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tools', toolRoutes); 
app.use('/api/institution', instRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/comments', commentRoutes);
app.use((err, req, res, next) => {
  console.error("🛑 Real Error:", err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
    error: err
  });
});
// Test Cloudinary Connection
const testCloudinary = async () => {
  try {
    const result = await cloudinary.uploader.upload("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png");
    console.log("✅ Cloudinary logic is perfect! URL:", result.secure_url);
  } catch (err) {
    console.log("❌ Cloudinary Credential Error:", err.message);
  }
};
testCloudinary();


// Basic Route
app.get('/', (req, res) => res.send('CampusVaiya API is running...'));

// Cron Job to expire help requests after 24 hours
cron.schedule('0 * * * *', async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const expiredRequests = await HelpRequest.find({
    status: 'Accepted',
    acceptedAt: { $lt: twentyFourHoursAgo }
  });

  for (let request of expiredRequests) {
    request.status = 'Open'; // আবার ওপেন করে দেওয়া যাতে অন্য কেউ হেল্প করতে পারে
    request.acceptedBy = null;
    await request.save();

    // সিনিয়রের ১০ পয়েন্ট কাটা
    await User.findByIdAndUpdate(request.acceptedBy, { $inc: { reputationPoints: -10 } });
  }
  console.log('Checked for expired help requests.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));