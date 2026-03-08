const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// ক্লাউডিনারি কনফিগারেশন (আপনার credentials দিয়ে)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'help_requests',
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image', // PDF হলে 'raw'
      public_id: Date.now() + '-' + file.originalname,
    };
  },
});

const upload = multer({ storage: storage });
module.exports = upload;