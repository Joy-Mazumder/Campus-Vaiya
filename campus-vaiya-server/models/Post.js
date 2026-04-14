const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  media: { type: String }, // Cloudinary Image URL
  file: { type: String },  // Cloudinary PDF/Resource URL
  postType: { type: String, enum: ['Social', 'Resource'], default: 'Social' },
  visibility: { type: String, enum: ['global', 'campus', 'friends'], default: 'global' },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' }, // কোন ক্যাম্পাসের পোস্ট
  
  subject: String,   
  semester: String,  
//   title: { type: String },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);