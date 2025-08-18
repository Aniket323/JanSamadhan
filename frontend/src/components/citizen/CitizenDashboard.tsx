import React, { useState, useEffect, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { pageContainer, mainContentStyle } from "../styles/layout";
import Navigation from "../common/Navigation";

// Interface for the grievance data coming from the API
interface ApiComplaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  submittedAt: string;
  grievanceId: string;
}

// Interface for the mapped grievance data used in the component's state
interface Grievance {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  submittedDate: string;
  trackingId: string;
  grievanceId: string;
}

const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userGrievances, setUserGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userType: string | null = localStorage.getItem("userType");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const response = await fetch(
          `https://citizen-grivance-system.onrender.com/api/complaints/userComplaints`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data: {
          email: string;
          complaints: ApiComplaint[];
          message?: string;
        } = await response.json();

        console.log(data.email);
        setUserEmail(data.email);
        if (response.ok) {
          // data.complaints is the array returned from backend
          const mapped: Grievance[] = data.complaints.map((g) => ({
            _id: g._id,
            title: g.title,
            description: g.description,
            category: g.category,
            priority: "Medium", // Assuming a default value as it's not from backend
            status: g.status || "Pending",
            submittedDate: g.submittedAt,
            trackingId: g.grievanceId,
            grievanceId: g.grievanceId,
          }));
          setUserGrievances(mapped);
        } else {
          console.error("Failed to fetch complaints:", data.message);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, []);

  // Redirect if not logged in as citizen
  useEffect(() => {
    if (!loading && (!userType || userType !== "citizen")) {
      navigate("/citizen/login");
    }
  }, [loading, userType, navigate]);

  const handleReopenGrievance = (trackingId: string): void => {
    // Navigate to reopening page
    navigate(`/citizen/reopen/${trackingId}`);
  };

  const handleTrackGrievance = (trackingId: string): void => {
    // Navigate to tracking page
    navigate(`/track/${trackingId}`);
  };

  const cardStyle: CSSProperties = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  };

  const statusStyle = (status: string): CSSProperties => {
    const base: CSSProperties = {
      fontWeight: "bold",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "14px",
      textTransform: "capitalize",
      display: "inline-block",
    };

    const colors: { [key: string]: CSSProperties } = {
      pending: { backgroundColor: "#fff3cd", color: "#856404" },
      in_progress: { backgroundColor: "#d1ecf1", color: "#0c5460" },
      revert_back: { backgroundColor: "#f8d7da", color: "#721c24" },
      resolved: { backgroundColor: "#d4edda", color: "#155724" },
    };

    return {
      ...base,
      ...(colors[status.toLowerCase().replace(/\s+/g, "_")] || {}),
    };
  };

  const buttonStyle: CSSProperties = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "8px",
    textDecoration: "none",
    display: "inline-block",
  };

  const trackButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white",
  };

  const reopenButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#ffc107",
    color: "#212529",
  };

  const statsCardStyle: CSSProperties = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    flex: 1,
    minWidth: "150px",
  };

  if (loading) {
    return (
      <div style={pageContainer}>
        <Navigation />
        <div style={mainContentStyle}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading your grievances...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!userType || userType !== "citizen") {
    return null; // Render nothing while redirecting
  }

  const formatGrievanceStatus = (status: string): string => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "revert_back":
        return "Revert Back";
      case "resolved":
        return "Resolved";
      case "pending":
        return "Pending";
      default:
        // Return the original status if it doesn't match any case
        return status;
    }
  };

  const stats = {
    total: userGrievances.length,
    resolved: userGrievances.filter((g) => g.status === "Resolved").length,
    inProgress: userGrievances.filter((g) => g.status === "In Progress").length,
    pending: userGrievances.filter((g) => g.status === "Pending").length,
  };

  const styles = {
    cardTitle: {
      fontSize: "14px",
      color: "#6c757d",
      marginBottom: "8px",
    },
    cardValue: {
      fontSize: "28px",
      fontWeight: 700,
      color: "#007bff",
    },
    sectionHeading: {
      fontSize: 24,
      fontFamily: "Roboto",
      fontWeight: 600,
      marginBottom: "20px",
    },
    noGrievanceText: {
      fontSize: "16px",
      color: "#6c757d",
      marginBottom: "20px",
    },
    grievanceTitle: {
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "8px",
    },
    grievanceDesc: {
      fontSize: "14px",
      color: "#6c757d",
      marginBottom: "10px",
    },
    grievanceInfoRow: {
      display: "flex",
      flexWrap: "wrap" as const, // explicitly tell TS it's a valid FlexWrap
      gap: "10px",
    },
    infoTag: {
      fontSize: "12px",
      color: "#6c757d",
    },
    actionButtons: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "flex-end" as const,
      gap: "10px",
    },
  };

  return (
    <div style={pageContainer}>
      <Navigation />
      <div style={mainContentStyle}>
        <h1
          style={{
            fontSize: "clamp(24px, 5vw, 40px)", // responsive title
            fontFamily: "Roboto",
            fontWeight: 700,
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          Welcome Back {userEmail.split("@")[0]} !
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "#6c757d",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          Track your submitted grievances and their current status
        </p>

        {/* Quick Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <div style={statsCardStyle}>
            <h3 style={styles.cardTitle}>Total Grievances</h3>
            <div style={styles.cardValue}>{stats.total}</div>
          </div>
          <div style={statsCardStyle}>
            <h3 style={styles.cardTitle}>Resolved</h3>
            <div style={{ ...styles.cardValue, color: "#28a745" }}>
              {stats.resolved}
            </div>
          </div>
          <div style={statsCardStyle}>
            <h3 style={styles.cardTitle}>In Progress</h3>
            <div style={{ ...styles.cardValue, color: "#ffc107" }}>
              {stats.inProgress}
            </div>
          </div>
          <div style={statsCardStyle}>
            <h3 style={styles.cardTitle}>Pending</h3>
            <div style={{ ...styles.cardValue, color: "#dc3545" }}>
              {stats.pending}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={cardStyle}>
          <h2 style={styles.sectionHeading}>Quick Actions</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column", // stack on mobile
              gap: "10px",
            }}
          >
            <button
              style={{
                ...trackButtonStyle,
                width: "100%",
                padding: "15px",
                fontSize: "14px",
              }}
              onClick={() => navigate("/submit")}
            >
              Submit New Grievance
            </button>
          </div>
        </div>

        {/* Your Grievances */}
        <div style={cardStyle}>
          <h2 style={styles.sectionHeading}>Your Grievances</h2>
          {userGrievances.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={styles.noGrievanceText}>
                You haven't submitted any grievances yet.
              </p>
              <button
                style={{
                  ...trackButtonStyle,
                  fontSize: "14px",
                  padding: "12px 24px",
                }}
                onClick={() => navigate("/submit")}
              >
                Submit Your First Grievance
              </button>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {userGrievances.map((grievance) => (
                <div
                  key={grievance._id}
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column", // stack on small screens
                      gap: "10px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.grievanceTitle}>{grievance.title}</h3>
                      <p style={styles.grievanceDesc}>
                        {grievance.description}
                      </p>
                      <div style={styles.grievanceInfoRow}>
                        <span style={styles.infoTag}>
                          Category: {grievance.category}
                        </span>
                        <span style={styles.infoTag}>
                          Priority: {grievance.priority}
                        </span>
                        <span style={styles.infoTag}>
                          Submitted:{" "}
                          {new Date(
                            grievance.submittedDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={styles.actionButtons}>
                      <span style={statusStyle(grievance.status)}>
                         {formatGrievanceStatus(grievance.status)}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          style={trackButtonStyle}
                          onClick={() =>
                            handleTrackGrievance(grievance.trackingId)
                          }
                        >
                          Track
                        </button>
                        {grievance.status.toLowerCase() === "resolved" && (
                          <button
                            style={reopenButtonStyle}
                            onClick={() =>
                              handleReopenGrievance(grievance.grievanceId)
                            }
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
