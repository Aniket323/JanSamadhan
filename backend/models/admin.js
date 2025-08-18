const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  admin_id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  role: {
    type: String,
    enum: ['superadmin', 'departmentadmin', 'viewer'],
    default: 'departmentadmin'
  },
  department: {
    type: String,
    required: function () {
      return this.role === 'departmentadmin';
    }
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admin', adminSchema);