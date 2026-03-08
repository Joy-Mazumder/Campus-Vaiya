const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === 'application/pdf';
    
    return {
      folder: 'CampusVaiya_Uploads',
      // PDF হলে 'raw', অন্যথায় 'auto' বা 'image'
      resource_type: isPDF ? 'raw' : 'auto', 
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      // PDF এর ক্ষেত্রে ফরম্যাট দেওয়া যাবে না, raw ফাইলে ফরম্যাট থাকে না
      format: isPDF ? undefined : file.mimetype.split('/')[1], 
    };
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
});

module.exports = { cloudinary, upload };