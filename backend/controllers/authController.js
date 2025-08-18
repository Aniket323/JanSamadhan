const User = require('../models/user');
const Otp = require('../models/otp');
const { v4: uuidv4 } = require('uuid');
const {sendEmail} = require('../utils/sendEmail');
const Complaint = require("../models/complaint");

const sendOtpToUser = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await Otp.create({ email, otp });


    const subject = "Your OTP for Citizens Grievance System";
    const text = `Your OTP is ${otp}. It is valid for 10 minutes.`;

    await sendEmail({ toEmail: email, subject, text });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};


const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    let user = await User.findOne({ email });
    const now = new Date();

    if (!user) {
      user = await User.create({
        email,
        citizen_id: uuidv4(),
        lastLogin: now
      });
    } else {
      user.lastLogin = now;
      await user.save();
    }

    await Otp.deleteMany({ email });

    req.session.user = {
      citizen_id: user.citizen_id,
      email: user.email,
      role:'citizen',
      loginTime: now
    };

    console.log('Session created:', req.session.user);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        citizen_id: user.citizen_id,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during verification", error: err.message });
  }
};


const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

module.exports = {
  sendOtpToUser,
  verifyOtp,
  logoutUser
};