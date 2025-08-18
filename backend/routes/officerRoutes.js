const express = require("express");
const router = express.Router();
const officerController = require("../controllers/officerController");
const officerDashboard= require('../controllers/officerDashboardController');
const requireOfficerSession = require('../middleware/requireOfficer');

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
router.post("/register/send-otp", officerController.sendOtpToOfficer);

router.post("/register", officerController.registerOfficer);

router.post("/login", officerController.loginOfficerOrAdmin);




router.get('/dashboard', requireOfficerSession, officerDashboard.getOfficerGrievances);
router.get('/grievance/:grievanceId', requireOfficerSession, officerDashboard.getGrievanceDetails);
router.post('/grievance/:grievanceId/update', requireOfficerSession, officerDashboard.updateGrievanceStatus);
router.post('/grievance/:grievanceId/evidence', requireOfficerSession, upload.single('file'), officerDashboard.uploadEvidence);


router.get('/stats', requireOfficerSession, officerDashboard.getOfficerComplaintStats); 

router.post('/submitUpdate/:grievanceId', requireOfficerSession, upload.single('file'), officerDashboard.submitGrievanceUpdate);

router.get('/analyticsDetails', officerDashboard.getOfficerAnalyticsDetails);

module.exports = router;
