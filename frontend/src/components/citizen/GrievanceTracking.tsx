import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DetailBlock from "../common/DetailBlock";
import { pageContainer } from "../styles/layout";

// Define Grievance and Log interfaces
interface GrievanceLog {
  status: string;
  message: string;
  officerName: string;
  timestamp: string;
}

interface GrievanceAttachment {
  fileUrl: string;
  fileType: string;
}

interface Grievance {
  id: string;
  date: string;
  category: string;
  description: string;
  department: string;
  contactEmail: string;
  location: string;
  status: string;
  officer: string;
  lastUpdated: string;
  resolution?: string;
  attachments: GrievanceAttachment[];
  logs: GrievanceLog[];
}

// Props for ActionLink
interface ActionLinkProps {
  text: string;
  onClick: () => void;
}

const ActionLink: React.FC<ActionLinkProps> = ({ text, onClick }) => (
  <div
    style={{
      fontSize: 18,
      cursor: "pointer",
      color: "#007BFF",
      textDecoration: "underline",
    }}
    onClick={onClick}
  >
    {text}
  </div>
);

const GrievanceTracking: React.FC = () => {
  const { trackingId } = useParams<{ trackingId: string }>();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrievance = async () => {
      try {
        const response = await fetch(
          `https://citizen-grivance-system.onrender.com/api/complaints/${trackingId}`
        );
        const data = await response.json();

        if (response.ok) {
          const g = data.complaint;
          console.log(g);
          setGrievance({
            id: g.grievanceId,
            date: new Date(g.submittedAt).toLocaleDateString(),
            category: g.category,
            description: g.description,
            department: g.department,
            contactEmail: g.contactEmail,
            location: g.location?.state || "N/A",
            status: g.status,
            officer: g.officer
              ? `${g.officer.name} (${g.officer.department})`
              : "Not Assigned",
            lastUpdated: new Date(g.updatedAt).toLocaleDateString(),
            resolution: g.resolution || "N/A",
            attachments: g.attachments || [],
            logs: g.logs || [],
          });
        } else {
          alert(data.message || "Could not fetch grievance");
        }
      } catch (error) {
        console.error("Error fetching grievance:", error);
        alert("Error fetching grievance data.");
      } finally {
        setLoading(false);
      }
    };

    const checkSession = async () => {
      try {
        const res = await fetch(
          "https://citizen-grivance-system.onrender.com/api/checkUserSession",
          {
            method: "GET",
            credentials: "include",
          }
        );
        setIsLoggedIn(res.ok); // true if 200 OK
      } catch (err) {
        console.error("Session check failed", err);
      }
    };

    if (trackingId) {
      fetchGrievance();
      checkSession();
    }
  }, [trackingId]);

  if (loading) return <div style={{ padding: 40 }}>Loading grievance...</div>;
  if (!grievance)
    return <div style={{ padding: 40 }}>Grievance not found.</div>;

  return (
    <div
      style={{
        ...pageContainer,
        maxWidth: 1200,
        margin: "80px auto",
        padding: "40px",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: 12,
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: 36, marginBottom: 32 }}>
        Grievance Tracking
      </h1>

      <div>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>Grievance Details</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
          <DetailBlock title="Grievance ID" value={grievance.id} />
          <DetailBlock title="Submission Date" value={grievance.date} />
          <DetailBlock title="Category" value={grievance.category} />
          <DetailBlock title="Department" value={grievance.department} />
          <DetailBlock title="Location" value={grievance.location} />
          <DetailBlock title="Contact Email" value={grievance.contactEmail} />
        </div>
        <div style={{ marginTop: 24 }}>
          <DetailBlock title="Description" value={grievance.description} />
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>Processing Status</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
          <DetailBlock
            title="Current Status"
            value={
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor:
                    grievance.status === "pending"
                      ? "#ffc107"
                      : grievance.status === "in_progress"
                      ? "#17a2b8"
                      : grievance.status === "revert_back"
                      ? "#fd7e14"
                      : grievance.status === "resolved"
                      ? "#28a745"
                      : "#6c757d",
                }}
              >
                {({
                  pending: "Pending",
                  in_progress: "In Progress",
                  revert_back: "Revert Back",
                  resolved: "Resolved",
                } as Record<string, string>)[grievance.status] ||
                  grievance.status}
              </span>
            }
          />

          <DetailBlock title="Assigned Officer" value={grievance.officer} />
          <DetailBlock
            title="Last Updated Date"
            value={grievance.lastUpdated}
          />
          <DetailBlock
            title="Expected Resolution Time"
            value={grievance.resolution || "N/A"}
          />
        </div>
      </div>

      {grievance.attachments && grievance.attachments.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>Attachments</h2>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {grievance.attachments.map((att, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <img
                  src={att.fileUrl}
                  alt={`attachment-${idx}`}
                  style={{ maxWidth: 250, maxHeight: 200, borderRadius: 8 }}
                />
                <p style={{ marginTop: 8, fontSize: 14 }}>{att.fileType}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {grievance.logs && grievance.logs.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>Logs</h2>
          {grievance.logs.map((log, index) => {
            const statusMap: Record<string, string> = {
              in_progress: "In Progress",
              pending: "Pending",
              revert_back: "Revert Back",
              resolved: "Resolved",
            };

            return (
              <div
                key={index}
                style={{
                  padding: 12,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  marginBottom: 12,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <p>
                  <strong>Status:</strong>{" "}
                  {statusMap[log.status] || log.status}
                </p>
                <p>
                  <strong>Message:</strong> {log.message}
                </p>
                <p>
                  <strong>By:</strong> {log.officerName}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          marginTop: 40,
          display: "flex",
          justifyContent: "center",
          gap: 60,
        }}
      >
        <ActionLink
          text="Refresh Status"
          onClick={() => window.location.reload()}
        />
        <ActionLink
          text="Back to Home"
          onClick={() => navigate(isLoggedIn ? "/citizen/dashboard" : "/")}
        />
        <ActionLink
          text="Contact Support"
          onClick={() => alert("Support clicked")}
        />
      </div>
    </div>
  );
};

export default GrievanceTracking;
