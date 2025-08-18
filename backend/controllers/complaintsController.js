const Complaint = require("../models/complaint");
const User = require("../models/user");
const Officer = require("../models/officer");
const { nanoid } = require('nanoid');
const cloudinary = require("../utils/cloudinary");
const { sendComplaintConfirmation } = require("../utils/sendEmail");

exports.submitComplaint = async (req, res) => {
  try {
    const email = req.session?.user?.email;
    if (!email) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No email in session" });
    }

    console.log(req.session.user);
    const { category, title, description} = req.body;
    
    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch (e) {
      return res.status(400).json({ message: "Invalid location format" });
    }


    console.log("Category ", category);
    console.log("title ", title);
    console.log("description ", description);
    console.log("location ", location);
    if (!email || !category || !description || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { district, city, pincode, addressLine } = location;

    const categoryToDepartment = {
      "Municipal Issues": "Municipal Corporation",
      "Utility Services": "Electricity & Water Department",
      "Public Safety & Law Enforcement": "Police Department",
      "Government Schemes & Services": "Administration",
      "Healthcare & Sanitation": "Health Department",
      "Education & Youth Services": "Education Department",
      "Transport & Infrastructure": "Transport Department",
      "Digital and Online Services": "IT Department",
      "Others (General Complaints)": "General Affairs",
    };

    const department = categoryToDepartment[category] || "General Affairs";

    let citizen = await User.findOne({ email });
    if (!citizen) {
      citizen = await User.create({ email });
    }

    const uploadedAttachments = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "grievance_attachments",
        });
        uploadedAttachments.push({
          fileUrl: result.secure_url,
          fileType: result.resource_type + "/" + result.format,
        });
      }
    }

    const applicant = "GRIEVANCE-";
    const grievanceId = applicant + nanoid(10);
    const newComplaint = new Complaint({
      grievanceId,
      title,
      category,
      description,
      department,
      location: {
        state: "Maharashtra",
        district,
        city,
        pincode,
        addressLine,
      },
      citizenId: citizen._id,
      contactInfo: { email },
      officerId: null,
      attachments: uploadedAttachments,
    });

    await newComplaint.save();

    citizen.complaint_ids = citizen.complaint_ids || [];
    citizen.complaint_ids.push(newComplaint._id);
    await citizen.save();

    await sendComplaintConfirmation({
      to: email,
      grievanceId,
      title,
      category,
      description,
      location,
    });
    console.log("grievanceId", grievanceId);
    return res.status(201).json({
      message: "Complaint submitted successfully 2",
      complaint: newComplaint,
      grievanceId,
    });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.trackComplaint = async (req, res) => {
  try {
    const { grievanceId } = req.params;

    const complaint = await Complaint.findOne({ grievanceId })
      .populate("citizenId", "email")
      .populate("officerId", "name department");

    if (!complaint) {
      return res.status(404).json({ message: "No complaint found with this Grievance ID" });
    }

    return res.status(200).json({
      message: "Complaint found",
      complaint: {
        grievanceId: complaint.grievanceId,
        title: complaint.title,
        category: complaint.category,
        description: complaint.description,
        department: complaint.department,
        status: complaint.status,
        location: complaint.location,
        contactEmail: complaint.contactInfo?.email,
        //
        officer: complaint.officerId || null,
        logs: complaint.logs || [],
        attachments: complaint.attachments || [],
        submittedAt: complaint.submittedAt,
        updatedAt: complaint.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error tracking complaint:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.getUserComplaints = async (req, res) => {
  try {
    try {
       if (!req.session.user || !req.session.user.email) {
         console.log("No session found:", req.session);
         return res.status(401).json({ message: "Unauthorized: Please log in" });
      }
    } catch (error) {
      console.error("Error fetching user complaints:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
    const email = req.session.user.email;
    console.log("Session user:", req.session.user.email);

   const complaints = await Complaint.find({ "contactInfo.email": email })
      .sort({ submittedAt: -1 });
    
    console.log("Complaints:", complaints);  

    res.status(200).json({ email, complaints });
  } catch (error) {
    console.error("Error fetching user complaints:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
