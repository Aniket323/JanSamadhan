const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  submitComplaint,
  trackComplaint,
  getUserComplaints,
} = require("../controllers/complaintsController");
const requireSession = require("../middleware/requireSession");
const {
  reopenComplaint,
  getCitizenGrievanceById,
} = require("../controllers/citizenReopenContoller");

const upload = multer({ dest: "uploads/" });

router.post("/submit", upload.array("attachments", 5), submitComplaint);

router.get("/userComplaints", requireSession, getUserComplaints);

router.get("/:grievanceId", trackComplaint);

router.post(
  "/:grievanceId/reopen",

  upload.single("evidence"),
  reopenComplaint
);

router.get("/grievances/:grievanceId", getCitizenGrievanceById);

module.exports = router;
