const Complaint = require("../models/complaint");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require("fs");

// REOPEN COMPLAINT
exports.reopenComplaint = async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const citizenEmail = req.session?.user?.email;
    const { remarks } = req.body;

    console.log(grievanceId, citizenEmail, remarks);

    if (!remarks || !remarks.trim()) {
      return res
        .status(400)
        .json({ message: "Remarks are required to reopen grievance." });
    }

    const complaint = await Complaint.findOne({ grievanceId });

    if (!complaint) {
      return res
        .status(404)
        .json({ message: "Complaint not found with this Grievance ID." });
    }

    if (complaint.status.toLowerCase() !== "resolved") {
      return res
        .status(400)
        .json({ message: "Only resolved grievances can be reopened." });
    }

    let uploadedEvidence = [];

    // If user uploaded new evidence
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "grievance_attachments",
        });
        console.log(result);
        uploadedEvidence.push({
          fileUrl: result.secure_url,
          fileType: result.resource_type + "/" + result.format,
        });

        // Delete file after uploading to Cloudinary
        fs.unlinkSync(file.path);
      }
    }

    // Update status to 'revert_back' and push to logs
    complaint.status = "revert_back";
    complaint.updatedAt = new Date();
    complaint.logs.push({
      status: "revert_back",
      message: remarks,
      by: "citizen",
      officerName: "Citizen",
      attachments: uploadedEvidence,
      timestamp: new Date(),
    });

    await complaint.save();

    return res
      .status(200)
      .json({ message: "Grievance reopened successfully", complaint });
  } catch (error) {
    console.error("Error reopening complaint:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getCitizenGrievanceById = async (req, res) => {
  const { grievanceId } = req.params;

  try {
    const complaint = await Complaint.findOne({ grievanceId })
      .populate("citizenId", "name email") // Optional
      .populate("officerId", "name email"); // Optional

    if (!complaint) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    return res.status(200).json(complaint);
  } catch (error) {
    console.error("Error fetching grievance by ID:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
