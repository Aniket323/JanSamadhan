const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  grievanceId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Municipal Issues',
      'Utility Services',
      'Public Safety & Law Enforcement',
      'Government Schemes & Services',
      'Healthcare & Sanitation',
      'Education & Youth Services',
      'Transport & Infrastructure',
      'Digital and Online Services',
      'Others (General Complaints)'
    ]
  },
  description: {
    type: String,
    required: true
  },
  location: {
    state: { type: String, default: 'Maharashtra' },
    district: { type: String },
    city: { type: String },
    addressLine: { type: String },
    pincode: { type: String }
  },
  department: {
    type: String,
    required: true
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  contactInfo: {
    email: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'revert_back'],
    //inprogress-- assigned to officer
    default: 'pending'
  },
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'officer',
    default: null
  },
  logs: [
    {
      status: { type: String },
      message: { type: String },
      by: { type: String },//officer ID
      officerName: { type: String },
      attachments: [{
         fileUrl: { type: String },
         fileType: { type: String },
      }],
      timestamp: { type: Date, default: Date.now }
    }
  ],
  attachments: [
    {
      fileUrl: { type: String },
      fileType: { type: String }
    }
  ],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
