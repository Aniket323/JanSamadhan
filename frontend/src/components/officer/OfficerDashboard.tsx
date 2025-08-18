import React, { useState, useEffect, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { pageContainer, mainContentStyle } from "../styles/layout";
import Navigation from "../common/Navigation";

// ### Type Definitions ###

// Defines the shape of a single grievance object from the API
interface Grievance {
  grievanceId: string;
  title: string;
  description: string;
  category: string;
  assignedDate: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Reverted' | 'in_progress';
  priority: 'High' | 'Medium' | 'Low';
}

// Defines the structure of the API response
interface ApiResponse {
  grievances: Grievance[];
  message?: string;
}

// ### Component ###

const OfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [assignedGrievances, setAssignedGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const response = await fetch(
          "https://citizen-grivance-system.onrender.com/api/officer/dashboard",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data: ApiResponse = await response.json();

        if (response.ok) {
          setAssignedGrievances(data.grievances || []);
        } else {
          // In a real app, use a modal/toast instead of alert
          alert(data.message || "Failed to load grievances");
        }
      } catch (err) {
        console.error("Error fetching officer grievances:", err);
        alert("Server error while fetching grievances.");
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, []);

  const handleViewDetails = (grievanceId: string): void => {
    navigate(`/officer/grievance/${grievanceId}`);
  };

  // ### Styles ###

  const tableStyle: CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginTop: "20px",
  };

  const thStyle: CSSProperties = {
    backgroundColor: "#f8f9fa",
    padding: "15px 12px",
    textAlign: "left",
    borderBottom: "2px solid #dee2e6",
    fontWeight: 600,
    fontSize: "14px",
    color: "#495057",
  };

  const tdStyle: CSSProperties = {
    padding: "12px",
    borderBottom: "1px solid #dee2e6",
    fontSize: "14px",
    color: "#212529",
    verticalAlign: 'middle',
  };

  const statusStyle = (status: Grievance['status']): CSSProperties => {
      const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
      const styles: {[key: string]: CSSProperties} = {
          pending: { backgroundColor: "#fff3cd", color: "#856404" },
          in_progress: { backgroundColor: "#cce5ff", color: "#004085" },
          resolved: { backgroundColor: "#d4edda", color: "#155724" },
          reverted: { backgroundColor: "#f8d7da", color: "#721c24" }
      };
      return {
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 500,
          textTransform: 'capitalize',
          ...styles[normalizedStatus]
      };
  };
  
  const priorityStyle = (priority: Grievance['priority']): CSSProperties => {
      const styles: {[key: string]: CSSProperties} = {
          High: { backgroundColor: "#f8d7da", color: "#721c24" },
          Medium: { backgroundColor: "#fff3cd", color: "#856404" },
          Low: { backgroundColor: "#d4edda", color: "#155724" }
      };
      return {
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 500,
          ...styles[priority]
      };
  };

  const buttonStyle: CSSProperties = {
    padding: "6px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <div style={pageContainer as CSSProperties}>
      <Navigation />
      <div style={mainContentStyle as CSSProperties}>
        <h1
          style={{
            fontSize: 40,
            fontFamily: "Roboto, sans-serif",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          Welcome, Officer
        </h1>
        <p style={{ fontSize: 16, color: "#6c757d", marginBottom: "30px" }}>
          Manage your assigned grievances and track their progress.
        </p>

        <h2
          style={{
            fontSize: 24,
            fontFamily: "Roboto, sans-serif",
            fontWeight: 600,
            marginBottom: "15px",
          }}
        >
          Assigned Grievances
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading assigned grievances...</p>
          </div>
        ) : assignedGrievances.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ fontSize: "16px", color: "#6c757d" }}>
              You have no grievances assigned at the moment.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Grievance ID</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Assigned Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedGrievances.map((grievance) => (
                  <tr key={grievance.grievanceId}>
                    <td style={tdStyle}>{grievance.grievanceId}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500 }}>{grievance.title}</div>
                      <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px" }}>
                        {grievance.description.substring(0, 50)}...
                      </div>
                    </td>
                    <td style={tdStyle}>{grievance.category}</td>
                    <td style={tdStyle}>
                      {new Date(grievance.assignedDate).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <span style={statusStyle(grievance.status)}>
                        {grievance.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={priorityStyle(grievance.priority)}>
                        {grievance.priority}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        style={buttonStyle}
                        onClick={() => handleViewDetails(grievance.grievanceId)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
