
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAdminSession = require('../middleware/requireAdminSession');

// (api/admin)

router.post('/login', adminController.loginAdmin);

//stats
router.get('/dashboard', requireAdminSession, adminController.dashboardStats);
router.get('/extendedAnalytics', requireAdminSession, adminController.getExtendedAnalytics);



//assign complaints 
router.get('/get-complaints', requireAdminSession, adminController.getDepartmentComplaints);
router.get('/get-officers', requireAdminSession, adminController.getDepartmentOfficers);
router.post('/assign', requireAdminSession, adminController.assignOfficerToComplaint);

//officer performance
router.get('/officerPerformance', requireAdminSession, adminController.getOfficerPerformance);
// router.get('/dashboard/officer-performance', officerDashboard.getOfficerPerformance);


module.exports = router;