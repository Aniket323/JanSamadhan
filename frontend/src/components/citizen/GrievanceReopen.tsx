import React, { useState, useEffect, CSSProperties, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pageContainer, mainContentStyle } from "../styles/layout";
import Navigation from "../../components/common/Navigation";


interface Attachment {
  fileUrl: string;

}

interface GrievanceLog {
  officerName?: string;
  timestamp: string;
  status?: string;
  message?: string;
}

// Describes the main grievance data object fetched from the API
interface GrievanceData {
  status: string;
  title: string;
  category: string;
  priority: string;
  grievanceId: string;
  description: string;
  submittedDate: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  attachments: Attachment[];
  logs: GrievanceLog[];
}

// ### Component ###

const GrievanceReopen: React.FC = () => {
  const { grievanceId } = useParams<{ grievanceId: string }>();
  const navigate = useNavigate();

  // State with types
  const [grievance, setGrievance] = useState<GrievanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newRemarks, setNewRemarks] = useState<string>("");
  const [newEvidence, setNewEvidence] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchGrievance = async () => {
      try {
        const res = await fetch(
          `https://citizen-grivance-system.onrender.com/api/complaints/grievances/${grievanceId}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch grievance");
        }

        setGrievance(data);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Failed to fetch grievance:", err.message);
        } else {
          console.error("An unknown error occurred:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (grievanceId) {
      fetchGrievance();
    }
  }, [grievanceId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewEvidence(e.target.files[0]);
    }
  };

  const handleSubmitReopen = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newRemarks.trim()) {
      alert("Please provide remarks for reopening the grievance.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("remarks", newRemarks);
      console.log(newEvidence);
      if (newEvidence) {
        formData.append("evidence", newEvidence);
      }

      const response = await fetch(
        `https://citizen-grivance-system.onrender.com/api/complaints/${grievanceId}/reopen`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reopen grievance");
      }

      alert("Grievance reopened successfully!");
      navigate("/citizen/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error reopening grievance:", error.message);
        alert(`Failed to reopen grievance: ${error.message}`);
      } else {
         console.error("An unknown error occurred during submission:", error);
         alert("An unknown error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ### Styles ###

  const cardStyle: CSSProperties = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  };

  const statusStyle = (status: string): CSSProperties => ({
    padding: "6px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor:
      status === "Pending"
        ? "#fff3cd"
        : status === "In Progress"
        ? "#cce5ff"
        : status === "Resolved"
        ? "#d4edda"
        : "#f8d7da",
    color:
      status === "Pending"
        ? "#856404"
        : status === "In Progress"
        ? "#004085"
        : status === "Resolved"
        ? "#155724"
        : "#721c24",
  });

  const buttonStyle: CSSProperties = {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    marginRight: "10px",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    marginBottom: "15px",
    boxSizing: 'border-box'
  };

  const textareaStyle: CSSProperties = {
    ...inputStyle,
    minHeight: "120px",
    resize: "vertical",
  };

  // ### Render Logic ###

  if (loading) {
    return (
      <div style={pageContainer}>
        <Navigation />
        <div style={mainContentStyle}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading grievance details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!grievance) {
    return (
      <div style={pageContainer}>
        <Navigation />
        <div style={mainContentStyle}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Error loading grievance or grievance not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      <Navigation />
      <div style={mainContentStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ fontSize: 32, fontFamily: "Roboto", fontWeight: 700 }}>
            Reopen Grievance
          </h1>
          <span style={statusStyle(grievance.status)}>{grievance.status}</span>
        </div>

        {/* Grievance Information */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 20, fontFamily: "Roboto", fontWeight: 600, marginBottom: "20px" }}>
            Grievance Details
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Title</h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>{grievance.title}</p>
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Category</h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>{grievance.category}</p>
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Tracking ID</h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>{grievance.grievanceId}</p>
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Submitted Date</h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>{new Date(grievance.submittedDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Resolved Date</h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>
                {grievance.resolvedDate ? new Date(grievance.resolvedDate).toLocaleDateString() : "Not available"}
              </p>
            </div>
          </div>
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Original Description</h3>
            <p style={{ fontSize: "14px", color: "#495057", lineHeight: "1.6" }}>{grievance.description}</p>
          </div>
        </div>

        {/* Resolution Information */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 20, fontFamily: "Roboto", fontWeight: 600, marginBottom: "20px" }}>
            Resolution Details
          </h2>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Resolution Notes</h3>
            <p style={{ fontSize: "14px", color: "#495057", lineHeight: "1.6" }}>
              {grievance.resolutionNotes || "No resolution notes provided."}
            </p>
          </div>
        </div>

        {/* Previous Evidence & Status History can be added back here if needed */}

        {/* Reopen Form */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 20, fontFamily: "Roboto", fontWeight: 600, marginBottom: "20px" }}>
            Reopen Grievance
          </h2>
          <form onSubmit={handleSubmitReopen}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Reason for Reopening *
              </label>
              <textarea
                value={newRemarks}
                onChange={(e) => setNewRemarks(e.target.value)}
                style={textareaStyle}
                placeholder="Explain why this grievance remains unresolved..."
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                New Evidence (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                style={inputStyle}
              />
              <small style={{ color: "#6c757d", fontSize: "12px" }}>
                Upload files to support your reopening request.
              </small>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" style={buttonStyle} disabled={submitting}>
                {submitting ? "Submitting..." : "Reopen Grievance"}
              </button>
              <button
                type="button"
                style={{ ...buttonStyle, backgroundColor: "#6c757d" }}
                onClick={() => navigate("/citizen/dashboard")}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GrievanceReopen;