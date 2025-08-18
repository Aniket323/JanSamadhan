import React, {
  useState,
  useEffect,
  CSSProperties,
  ChangeEvent,
  FormEvent,
} from "react";
import { useParams } from "react-router-dom";
import { pageContainer, mainContentStyle } from "../styles/layout";
import { useNavigate } from "react-router-dom";
import Navigation from "../../components/common/Navigation";

// ### Type Definitions ###

type GrievanceStatus =
  | "Pending"
  | "In Progress"
  | "Resolved"
  | "Reverted"
  | "in_progress";
type GrievancePriority = "High" | "Medium" | "Low";
type UpdateStatus = "in_progress" | "resolved" | "";

interface Location {
  address: string;
  // Add other location properties if they exist
}

interface Evidence {
  fileUrl?: string;
  url?: string;
  description?: string;
  fileType?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}
interface LogAttachment {
  fileUrl: string;
  fileType: string;
}

interface GrievanceLog {
  officerName: string;
  timestamp: string;
  status?: GrievanceStatus;
  message?: string;
  attachments?: LogAttachment[];
}

interface GrievanceDetails {
  status: GrievanceStatus;
  title: string;
  category: string;
  priority: GrievancePriority;
  submittedDate: string;
  assignedDate: string;
  location: Location;
  description: string;
  citizen: string; // Assuming this is an email or ID
  evidence: Evidence[];
  logs: GrievanceLog[];
}

// ### Component ###

const OfficerGrievanceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { grievanceId } = useParams<{ grievanceId: string }>();

  // State with explicit types
  const [grievance, setGrievance] = useState<GrievanceDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("");
  const [updateNotes, setUpdateNotes] = useState<string>("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `https://citizen-grivance-system.onrender.com/api/officer/grievance/${grievanceId}`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();

        if (res.ok) {
          setGrievance(data.grievance);
        } else {
          alert(data.message || "Failed to fetch details");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        alert("Server error fetching details.");
      } finally {
        setLoading(false);
      }
    };

    if (grievanceId) {
      fetchDetails();
    }
  }, [grievanceId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  const handleCombinedSubmit = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (updateStatus === "resolved" && !evidenceFile) {
      alert("Please upload evidence when status is set to Resolved.");
      return;
    }

    const formData = new FormData();
    formData.append("nstatus", updateStatus);
    formData.append("notes", updateNotes);
    if (evidenceFile) {
      formData.append("file", evidenceFile);
    }

    try {
      const res = await fetch(
        `https://citizen-grivance-system.onrender.com/api/officer/submitUpdate/${grievanceId}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Update submitted successfully");
        setGrievance(data.grievance); // Refresh details on the page
        navigate("/officer/dashboard");
      } else {
        alert(data.message || "Failed to submit update");
      }
    } catch (err) {
      console.error("Combined submit error:", err);
      alert("Server error during update.");
    }

    // Reset form fields
    setUpdateStatus("");
    setUpdateNotes("");
    setEvidenceFile(null);
    // Optionally clear the file input visually
    const fileInput = e.currentTarget.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // ### Styles ###

  const cardStyle: CSSProperties = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  };

  const statusStyle = (
    status: GrievanceStatus | GrievancePriority
  ): CSSProperties => {
    const statusMap: { [key: string]: CSSProperties } = {
      Pending: { backgroundColor: "#fff3cd", color: "#856404" },
      "In Progress": { backgroundColor: "#cce5ff", color: "#004085" },
      Resolved: { backgroundColor: "#d4edda", color: "#155724" },
      Reverted: { backgroundColor: "#f8d7da", color: "#721c24" },
      High: { backgroundColor: "#f8d7da", color: "#721c24" },
      Medium: { backgroundColor: "#fff3cd", color: "#856404" },
      Low: { backgroundColor: "#d4edda", color: "#155724" },
    };
    return {
      padding: "6px 12px",
      borderRadius: "16px",
      fontSize: "12px",
      fontWeight: 600,
      ...statusMap[status],
    };
  };

  const buttonStyle: CSSProperties = {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    marginBottom: "15px",
    boxSizing: "border-box",
  };

  const textareaStyle: CSSProperties = {
    ...inputStyle,
    minHeight: "100px",
    resize: "vertical",
  };

  if (loading) {
    return (
      <div style={pageContainer as CSSProperties}>
        <Navigation />
        <div style={mainContentStyle as CSSProperties}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading grievance details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!grievance) {
    return (
      <div style={pageContainer as CSSProperties}>
        <Navigation />
        <div style={mainContentStyle as CSSProperties}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Could not load grievance details.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer as CSSProperties}>
      <Navigation />
      <div style={mainContentStyle as CSSProperties}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: 32,
              fontFamily: "Roboto, sans-serif",
              fontWeight: 700,
            }}
          >
            Grievance Details
          </h1>
          <span style={statusStyle(grievance.status)}>{grievance.status}</span>
        </div>

        {/* Grievance Information */}
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: 20,
              fontFamily: "Roboto, sans-serif",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Grievance Information
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Title
              </h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>
                {grievance.title}
              </p>
            </div>
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Category
              </h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>
                {grievance.category}
              </p>
            </div>
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Priority
              </h3>
              <span style={statusStyle(grievance.priority)}>
                {grievance.priority}
              </span>
            </div>
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Submitted Date
              </h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>
                {new Date(grievance.submittedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Assigned Date
              </h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>
                {new Date(grievance.assignedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                Location
              </h3>
              <p style={{ fontSize: "14px", color: "#495057" }}>
                {grievance.location.address}
              </p>
            </div>
          </div>
          <div style={{ marginTop: "20px" }}>
            <h3
              style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}
            >
              Description
            </h3>
            <p style={{ fontSize: "14px", color: "#495057", lineHeight: 1.6 }}>
              {grievance.description}
            </p>
          </div>
        </div>

        {/* Citizen Information */}
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: 20,
              fontFamily: "Roboto, sans-serif",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Citizen Information
          </h2>
          <div>
            <h3
              style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}
            >
              Email
            </h3>
            <p style={{ fontSize: "14px", color: "#495057" }}>
              {grievance.citizen}
            </p>
          </div>
        </div>

        {/* Evidence */}
        <div className="evidence-container" style={cardStyle}>
          <h2 className="evidence-header">Evidence</h2>
          {grievance.evidence?.length > 0 ? (
            <div className="evidence-grid">
              {grievance.evidence.map((item, index) => (
                <div key={index} className="evidence-item">
                  <div className="image-container">
                    <img
                      src={item.fileUrl || item.url}
                      alt={item.description || "No description"}
                      className="evidence-image"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-evidence-text">
              No evidence uploaded by the citizen.
            </p>
          )}
        </div>

        {/* Status Updates */}
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: 20,
              fontFamily: "Roboto, sans-serif",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Status History
          </h2>
          {grievance.logs?.length > 0 ? (
            
            grievance.logs.map((log, index) => (

              <div
                key={index}
                style={{
                  padding: "15px",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  marginBottom: "10px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>
                    {log.officerName}
                  </span>
                  <span style={{ fontSize: "12px", color: "#6c757d" }}>
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {log.status && (
                  <span style={statusStyle(log.status)}>
                    {log.status.replace("_", " ")}
                  </span>
                )}
                {log.message && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#495057",
                      marginTop: "8px",
                    }}
                  >
                    {log.message}
                  </p>
                )}
                {(log.attachments?.length ?? 0) > 0 && (
  <div style={{ marginTop: "10px" }}>
    <strong>Attachments:</strong>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {log.attachments!.map((att, idx) => {
        const isImage = att.fileType?.startsWith("image/");
        return (
          <li key={idx} style={{ marginBottom: "10px" }}>
            {isImage ? (
              <img
                src={att.fileUrl}
                alt={`Attachment ${idx + 1}`}
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            ) : (
              <a
                href={att.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007bff" }}
              >
                {att.fileType?.split("/")[1]?.toUpperCase() || "File"}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  </div>
)}

              </div>
            ))
          ) : (
            <p style={{ fontSize: "14px", color: "#6c757d" }}>
              No status updates have been logged yet.
            </p>
          )}
        </div>

        {/* Add Status Update Form */}
        <form onSubmit={handleCombinedSubmit} style={cardStyle}>
          <h2
            style={{
              fontSize: 20,
              fontFamily: "Roboto, sans-serif",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Add Status Update
          </h2>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}
            >
              Status:
            </label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value as UpdateStatus)}
              style={inputStyle}
              required
            >
              <option value="">Select Status</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}
            >
              Notes:
            </label>
            <textarea
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              style={textareaStyle}
              placeholder="Add update notes..."
              required
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}
            >
              Upload Evidence{" "}
              {updateStatus === "resolved" && (
                <span style={{ color: "red" }}>*</span>
              )}
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              style={inputStyle}
              required={updateStatus === "resolved"}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Submit Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfficerGrievanceDetails;
