const mongoose = require('mongoose');

const claimRequestSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // যে ক্লেইম করছে
  reason: { type: String, required: true }, // কেন সে ক্লেইম করছে
  proofDetails: {
    eiinNumber: String,
    licensePdf: String,
    idCard: String
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  adminNote: String // এডমিন যদি কোনো কারণ বা নোট দিতে চায়
}, { timestamps: true });

module.exports = mongoose.model('ClaimRequest', claimRequestSchema);