const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// const getUserComplaints=require('../controllers/authController');

router.post('/send-otp', authController.sendOtpToUser);
router.post('/verify-otp', authController.verifyOtp);

router.post('/logout', authController.logoutUser);


//otp for complaint

module.exports = router;
