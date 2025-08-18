import React, { useState, useEffect, CSSProperties, ChangeEvent } from "react";
import { pageContainer, mainContentStyle } from "../styles/layout";
import Navigation from "../common/Navigation";

// --- Type Definitions ---

interface Grievance {
  grievanceId: string;
  title: string;
  category: string;
  submittedAt: string;
  status: "Pending" | "In Progress" | "Resolved" | "Assigned" | string;
  citizenId?: { name: string; email: string };
  officerId?: { name: string; email: string } | null;
}

interface Officer {
  email: string;
  name: string;
}

type SelectedOfficerState = Record<string, string>;
type ViewMode = "pending" | "all";

// --- Component ---

const AdminDashboard: React.FC = () => {
  const [pendingAssignments, setPendingAssignments] = useState<Grievance[]>([]);
  const [allComplaints, setAllComplaints] = useState<Grievance[]>([]); // NEW
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<SelectedOfficerState>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<ViewMode>("pending"); // NEW

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, officersRes, allComplaintsRes] =
          await Promise.all([
            fetch(
              "https://citizen-grivance-system.onrender.com/api/admin/get-complaints",
              { method: "GET", credentials: "include" }
            ),
            fetch(
              "https://citizen-grivance-system.onrender.com/api/admin/get-officers",
              { method: "GET", credentials: "include" }
            ),
            fetch(
              "https://citizen-grivance-system.onrender.com/api/admin/get-all-complaints",
              { method: "GET", credentials: "include" }
            ), // NEW
          ]);

        const complaintsData = await complaintsRes.json();
        const officersData = await officersRes.json();
        const allComplaintsData = await allComplaintsRes.json();

        if (!complaintsRes.ok)
          throw new Error(
            complaintsData.message || "Failed to fetch pending complaints"
          );
        if (!officersRes.ok)
          throw new Error(officersData.message || "Failed to fetch officers");
        if (!allComplaintsRes.ok)
          throw new Error(
            allComplaintsData.message || "Failed to fetch all complaints"
          );

        setPendingAssignments(complaintsData.complaints || []);
        setOfficers(officersData.officers || []);
        setAllComplaints(allComplaintsData.complaints || []); // NEW
      } catch (err: any) {
        console.error("Error fetching admin data:", err);
        alert(err.message || "Could not fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignGrievance = async (
    grievanceId: string,
    officerName: string
  ) => {
    if (!officerName) {
      alert("Please select an officer to assign.");
      return;
    }
    try {
      const res = await fetch(
        "https://citizen-grivance-system.onrender.com/api/admin/assign",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grievanceId, officerName }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPendingAssignments((prev) =>
          prev.filter((g) => g.grievanceId !== grievanceId)
        );
        setSelectedOfficer((prev) => {
          const updated = { ...prev };
          delete updated[grievanceId];
          return updated;
        });
        // Also reflect in allComplaints view if it exists there
        setAllComplaints((prev) =>
          prev.map((g) =>
            g.grievanceId === grievanceId
              ? { ...g, assignedOfficerName: officerName, status: "Assigned" }
              : g
          )
        );
      } else {
        alert(data.message || "Assignment failed");
      }
    } catch (err) {
      console.error("Error assigning officer:", err);
      alert("Server error while assigning officer");
    }
  };

  const handleOfficerSelection = (
    e: ChangeEvent<HTMLSelectElement>,
    grievanceId: string
  ) => {
    setSelectedOfficer((prev) => ({ ...prev, [grievanceId]: e.target.value }));
  };

  // --- Styles ---

  const cardStyle: CSSProperties = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  };

  const headerRow: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  };

  const toggleWrap: CSSProperties = {
    display: "inline-flex",
    border: "1px solid #dee2e6",
    borderRadius: 8,
    overflow: "hidden",
  };

  const toggleBtn = (active: boolean): CSSProperties => ({
    padding: "8px 14px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    background: active ? "#0d6efd" : "#ffffff",
    color: active ? "#fff" : "#0d6efd",
    border: "none",
    outline: "none",
  });

  const tableStyle: CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  };

  const thStyle: CSSProperties = {
    backgroundColor: "#f8f9fa",
    padding: "12px",
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
    verticalAlign: "middle",
  };

  const statusPill = (status: Grievance["status"]): CSSProperties => ({
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 500,
    backgroundColor:
      status === "Pending"
        ? "#f8d7da"
        : status === "In Progress"
        ? "#fff3cd"
        : status === "Resolved"
        ? "#d4edda"
        : "#e2e3e5",
    color:
      status === "Pending"
        ? "#721c24"
        : status === "In Progress"
        ? "#856404"
        : status === "Resolved"
        ? "#155724"
        : "#383d41",
  });

  const buttonStyle: CSSProperties = {
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "8px",
  };

  const assignButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white",
  };

  // --- Render ---

  if (loading) {
    return (
      <div style={pageContainer}>
        <Navigation />
        <div style={mainContentStyle}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeRows = view === "pending" ? pendingAssignments : allComplaints;

  return (
    <div style={pageContainer}>
      <Navigation />
      <div style={mainContentStyle}>
        <h1
          style={{
            fontSize: 40,
            fontFamily: "Roboto",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 16, color: "#6c757d", marginBottom: "30px" }}>
          Manage grievance assignments and review resolutions
        </p>

        <div style={cardStyle}>
          <div style={headerRow}>
            <h2
              style={{
                fontSize: 24,
                fontFamily: "Roboto",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {view === "pending"
                ? `Pending Assignments (${pendingAssignments.length})`
                : `All Complaints (${allComplaints.length})`}
            </h2>

            {/* NEW: toggle */}
            <div style={toggleWrap} role="tablist" aria-label="Complaint view">
              <button
                type="button"
                style={toggleBtn(view === "pending")}
                onClick={() => setView("pending")}
                role="tab"
                aria-selected={view === "pending"}
              >
                Pending
              </button>
              <button
                type="button"
                style={toggleBtn(view === "all")}
                onClick={() => setView("all")}
                role="tab"
                aria-selected={view === "all"}
              >
                All
              </button>
            </div>
          </div>

          {activeRows.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#6c757d" }}>
              {view === "pending"
                ? "No pending assignments."
                : "No complaints found."}
            </p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Grievance ID</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Submitted On</th>
                  {view === "all" && <th style={thStyle}>Assigned Officer</th>}

                  {view === "pending" && <th style={thStyle}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {activeRows.map((grievance) => (
                  <tr key={grievance.grievanceId}>
                    <td style={tdStyle}>{grievance.grievanceId}</td>
                    <td style={tdStyle}>{grievance.title}</td>
                    <td style={tdStyle}>{grievance.category}</td>
                    <td style={tdStyle}>
                      <span style={statusPill(grievance.status)}>
                        {grievance.status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {new Date(grievance.submittedAt).toLocaleDateString()}
                    </td>
                    {/* <td style={tdStyle}>{grievance.citizen}</td> */}

                    {view === "all" && (
                      <>
                        <td style={tdStyle}>
                          {grievance.officerId?.name || "—"}
                        </td>
                      </>
                    )}

                    {view === "pending" && (
                      <td style={tdStyle}>
                        <select
                          value={selectedOfficer[grievance.grievanceId] || ""}
                          onChange={(e) =>
                            handleOfficerSelection(e, grievance.grievanceId)
                          }
                          style={{
                            padding: "5px 8px",
                            marginRight: "8px",
                            fontSize: "12px",
                            height: "30px",
                          }}
                        >
                          <option value="">Select Officer</option>
                          {officers.map((officer) => (
                            <option key={officer.email} value={officer.name}>
                              {officer.name}
                            </option>
                          ))}
                        </select>
                        <button
                          style={assignButtonStyle}
                          onClick={() =>
                            handleAssignGrievance(
                              grievance.grievanceId,
                              selectedOfficer[grievance.grievanceId]
                            )
                          }
                          disabled={!selectedOfficer[grievance.grievanceId]}
                        >
                          Assign
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
