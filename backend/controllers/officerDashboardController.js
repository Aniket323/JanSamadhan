const Complaint = require('../models/complaint');
const Officer = require('../models/officer');
const cloudinary = require("../utils/cloudinary");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.getOfficerGrievances = async (req, res) => {
  try {
    const officerEmail = req.session.officer?.email;
    if (!officerEmail) {
      return res.status(401).json({ message: 'Unauthorized: Officer not logged in' });
    }

    const officer = await Officer.findOne({ email: officerEmail });
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    const { department } = officer;
    const grievances = await Complaint.find({
      department,
      officerId: officer._id
    }).sort({ submittedAt: -1 });

    const formattedGrievances = grievances.map(c => ({
      grievanceId: c.grievanceId,
      title: c.title,
      description: c.description,
      category: c.category,
      priority: c.priority,
      status: c.status,
      submittedDate: c.submittedAt,
      assignedDate: c.updatedAt,
      location: c.location,
      citizen: c.citizenId ? {
        name: c.citizenId.name,
        email: c.citizenId.email,
        phone: c.citizenId.phone
      } : null,
      evidence: c.attachments || [],
      logs: c.logs || []
    }));

    res.status(200).json({ grievances: formattedGrievances });
  } catch (error) {
    console.error('Error fetching officer grievances:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getGrievanceDetails = async (req, res) => {
  try {
    const officerEmail = req.session.officer?.email;
    const grievanceId = req.params.grievanceId;
    if (!officerEmail) {
      return res.status(401).json({ message: 'Unauthorized: Officer not logged in' });
    }

    const officer = await Officer.findOne({ email: officerEmail });
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    const complaint = await Complaint.findOne({
      grievanceId,
      officerId: officer._id
    }).populate('citizenId', 'name email phone');

    if (!complaint) {
      return res.status(404).json({ message: 'Grievance not found or not assigned to you' });
    }

    const grievanceDetails = {
      grievanceId: complaint.grievanceId,
      title: complaint.title,
      category: complaint.category,
      description: complaint.description,
      location: {
      address: `${complaint.location.addressLine}, 
         ${complaint.location.city}, 
         ${complaint.location.district}, 
         ${complaint.location.state} -
          ${complaint.location.pincode}`,
      },
      status: complaint.status,
      priority: complaint.priority,
      submittedDate: complaint.submittedAt,
      assignedDate: complaint.updatedAt,
      citizen: complaint.contactInfo.email ,
      evidence: complaint.attachments || [],
      logs: complaint.logs || []
    };

    res.status(200).json({ grievance: grievanceDetails });
  } catch (error) {
    console.error('Error fetching grievance details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getOfficerComplaintStats = async (req, res) => {
  try {
    const officerEmail = req.session.officer?.email;

    if (!officerEmail) {
      return res.status(401).json({ message: "Unauthorized: Officer not logged in" });
    }

    const officer = await Officer.findOne({ email: officerEmail });

    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    const officerId = officer._id;

    const statuses = ['pending', 'in_progress', 'resolved', 'revert_back'];

    const stats = {};
    for (const status of statuses) {
      stats[status] = await Complaint.countDocuments({
        officerId,
        status
      });
    }

    const totalAssigned = Object.values(stats).reduce((acc, val) => acc + val, 0);

    res.status(200).json({
      totalAssigned,
      pending: stats.pending,
      in_progress: stats.in_progress,
      resolved: stats.resolved,
      revert_back: stats.revert_back
    });
  } catch (error) {
    console.error("Error fetching officer complaint stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.updateGrievanceStatus = async (req, res) => {
  try {
    const officerEmail = req.session.officer?.email;
    const { grievanceId } = req.params;
    const { nstatus, notes } = req.body;

    if (!officerEmail) return res.status(401).json({ message: 'Unauthorized' });

    const officer = await Officer.findOne({ email: officerEmail });
    if (!officer) return res.status(404).json({ message: 'Officer not found' });

    const complaint = await Complaint.findOneAndUpdate(
      { grievanceId, officerId: officer._id },
      {
        $set: {
          status: nstatus,
          updatedAt: new Date()
        },
        $push: {
          logs: {
            status: nstatus.toLowerCase(),
            message: notes,
            by: officer.name,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ message: 'Not assigned' });
    res.json({ message: 'Updated!', grievance: complaint });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.uploadEvidence = async (req, res) => {
  try {
    const officerEmail = req.session.officer?.email;
    const { grievanceId } = req.params;
    const file = req.file;

    if (!officerEmail || !file) return res.status(400).json({ message: 'Invalid request' });

    const officer = await Officer.findOne({ email: officerEmail });
    if (!officer) return res.status(404).json({ message: 'Officer not found' });

    const uploaded = await cloudinary.uploader.upload(file.path);

    const complaint = await Complaint.findOneAndUpdate(
      { grievanceId, officerId: officer._id },
      {
        $push: {
          attachments: {
            fileUrl: uploaded.secure_url,
            fileType: uploaded.resource_type + '/' + uploaded.format,
            uploadedBy: officer.name,
            uploadedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ message: 'Not assigned' });
    res.json({ message: 'Evidence submitted', grievance: complaint });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


//updated submit update
exports.submitGrievanceUpdate = async (req, res) => {
  try {
    const officerEmail = req.session.officer?.email;
    const { grievanceId } = req.params;
    const { nstatus, notes } = req.body;
    const file = req.file;

    if (!officerEmail || !grievanceId || !nstatus || !notes) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const officer = await Officer.findOne({ email: officerEmail });
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    let attachments = [];

    if (file) {
      const uploaded = await cloudinary.uploader.upload(file.path);
      attachments.push({
        fileUrl: uploaded.secure_url,
        fileType: `${uploaded.resource_type}/${uploaded.format}`
      });
    }

    const updatedComplaint = await Complaint.findOneAndUpdate(
      { grievanceId, officerId: officer._id },
      {
        status: nstatus,
        $push: {
          logs: {
            status: nstatus,
            officerName: officer.name,
            message: notes,
            by: officer._id.toString(), // storing officer ID as string
            attachments: attachments,
            timestamp: new Date()
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: 'Complaint not found or not assigned to officer' });
    }

    res.status(200).json({ message: 'Update submitted successfully', grievance: updatedComplaint });

  } catch (err) {
    console.error('Submit grievance update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getOfficerAnalyticsDetails = async (req, res) => {
  try {
    const officerEmail = req.session.officer?.email;
    if (!officerEmail) {
      return res.status(401).json({ message: 'Unauthorized: Officer not logged in' });
    }

    const officer = await Officer.findOne({ email: officerEmail });
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    const officerId = officer._id;
    const complaints = await Complaint.find({ officerId });

    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' && c.submittedAt && c.updatedAt);
    const totalResolutionDays = resolvedComplaints.reduce((sum, c) => {
      const diff = Math.abs(new Date(c.updatedAt) - new Date(c.submittedAt));
      return sum + diff / (1000 * 60 * 60 * 24); // convert ms to days
    }, 0);
    const averageResolutionTime = resolvedComplaints.length
      ? (totalResolutionDays / resolvedComplaints.length).toFixed(1)
      : '0';

    const categoryCountMap = {};
    complaints.forEach(c => {
      const cat = c.category || 'Other';
      categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
    });
    const total = complaints.length;
    const categoryBreakdown = Object.entries(categoryCountMap).map(([category, count]) => ({
      category,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    }));

    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        assigned: 0,
        resolved: 0
      };
    });

    complaints.forEach(c => {
      const monthIndex = monthlyTrends.findIndex(mt =>
        new Date(c.submittedAt).getMonth() === new Date(`${mt.month} 1, ${new Date().getFullYear()}`).getMonth()
      );
      if (monthIndex !== -1) {
        monthlyTrends[monthIndex].assigned += 1;
        if (c.status === 'resolved') {
          monthlyTrends[monthIndex].resolved += 1;
        }
      }
    });

    const performanceMetrics = {
      responseTime: '2.1 days',
      resolutionRate: `${((resolvedComplaints.length / (complaints.length || 1)) * 100).toFixed(0)}%`,
      satisfactionScore: '4.2/5'
    };

    res.status(200).json({
      averageResolutionTime,
      categoryBreakdown,
      monthlyTrends,
      performanceMetrics
    });
  } catch (error) {
    console.error('Error fetching officer analytics details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
