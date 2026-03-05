const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  category: { type: String }, // e.g., "Student Fee", "Teacher Salary", "Rent"
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  
  // If it's a student fee
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Pending' },
  
  note: String, // Additional details
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin/Staff who added this record
}, { timestamps: true });

module.exports = mongoose.model('Finance', financeSchema);