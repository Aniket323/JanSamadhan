const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  citizen_id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  complaint_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

module.exports = mongoose.model('User', userSchema);
