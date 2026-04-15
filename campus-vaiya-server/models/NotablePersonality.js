const mongoose = require('mongoose');

const notablePersonalitySchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  name: { type: String, required: true },
  title: { type: String, default: '' },
  quote: { type: String, required: true },
  image: { type: String, default: '' },
  category: {
  type: String,
  default: 'Other'   // no enum — any authority title is accepted
},
  yearOfGraduation: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('NotablePersonality', notablePersonalitySchema);
