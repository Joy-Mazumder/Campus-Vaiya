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
    // ফাইলের ধরন অনুযায়ী resource_type এবং ফরম্যাট হ্যান্ডেল করা
    const isPDF = file.mimetype === 'application/pdf';
    
    return {
      folder: 'CampusVaiya_Uploads',
      resource_type: 'auto', // Cloudinary নিজে থেকে PDF বা Image বুঝে নিবে
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
});

module.exports = { cloudinary, upload };