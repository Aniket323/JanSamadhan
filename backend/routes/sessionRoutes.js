const express = require('express');
const router = express.Router();
const { checkUserSession , checkOfficerSession, checkAdminSession } = require('../controllers/sessionController');

router.get('/checkUserSession', checkUserSession);
router.get('/checkOfficerSession', checkOfficerSession);
router.get('/checkAdminSession', checkAdminSession);

module.exports = router;