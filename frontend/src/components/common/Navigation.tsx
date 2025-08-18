import React, { useEffect, CSSProperties, JSX } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { headerStyle } from "../styles/layout";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType: string | null = localStorage.getItem("userType");

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch("https://citizen-grivance-system.onrender.com/api/logout", {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }

    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const validateSession = async () => {
      const endpointMap: { [key: string]: string } = {
        citizen: "/api/checkUserSession",
        officer: "/api/checkOfficerSession",
        admin: "/api/checkAdminSession",
      };
      
      // If userType is null or not a valid key, endpoint will be undefined
      const endpoint = userType ? endpointMap[userType] : undefined;
      if (!endpoint) return;

      try {
        const res = await fetch(
          `https://citizen-grivance-system.onrender.com${endpoint}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          localStorage.clear();
          navigate("/");
        }
      } catch {
        localStorage.clear();
        navigate("/");
      }
    };

    validateSession();
  }, [userType, navigate]);

  const navStyle: CSSProperties = {
    ...headerStyle,
    justifyContent: "space-between",
  };

  const leftSectionStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  };

  const rightSectionStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  };

  const navButtonStyle = (isActive: boolean): CSSProperties => ({
    padding: "8px 16px",
    backgroundColor: isActive ? "#007bff" : "transparent",
    color: isActive ? "white" : "#6c757d",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "none",
  });

  const logoutButtonStyle: CSSProperties = {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  };

  // Citizen Navigation
  const CitizenNav: React.FC = () => (
    <div style={leftSectionStyle}>
      <div style={{ fontSize: 24, fontFamily: "Roboto", fontWeight: 500 }}>
        Citizen Portal
      </div>
      <button
        style={navButtonStyle(location.pathname === "/citizen/dashboard")}
        onClick={() => navigate("/citizen/dashboard")}
      >
        Dashboard
      </button>
      <button
        style={navButtonStyle(location.pathname === "/submit")}
        onClick={() => navigate("/submit")}
      >
        Submit Grievance
      </button>
    </div>
  );

  // Officer Navigation
  const OfficerNav: React.FC = () => (
    <div style={leftSectionStyle}>
      <div style={{ fontSize: 24, fontFamily: "Roboto", fontWeight: 500 }}>
        Officer Portal
      </div>
      <button
        style={navButtonStyle(location.pathname === "/officer/dashboard")}
        onClick={() => navigate("/officer/dashboard")}
      >
        Dashboard
      </button>
      <button
        style={navButtonStyle(location.pathname === "/officer/analytics")}
        onClick={() => navigate("/officer/analytics")}
      >
        Analytics
      </button>
    </div>
  );

  // Admin Navigation
  const AdminNav: React.FC = () => (
    <div style={leftSectionStyle}>
      <div style={{ fontSize: 24, fontFamily: "Roboto", fontWeight: 500 }}>
        Admin Portal
      </div>
      <button
        style={navButtonStyle(location.pathname === "/admin/dashboard")}
        onClick={() => navigate("/admin/dashboard")}
      >
        Dashboard
      </button>
      <button
        style={navButtonStyle(location.pathname === "/admin/analytics")}
        onClick={() => navigate("/admin/analytics")}
      >
        Analytics
      </button>
    </div>
  );

  const renderNavigation = (): JSX.Element | null => {
    switch (userType) {
      case "citizen":
        return <CitizenNav />;
      case "officer":
        return <OfficerNav />;
      case "admin":
        return <AdminNav />;
      default:
        return null;
    }
  };

  if (!userType) {
    return null; // Don't show navigation for unauthenticated users
  }

  return (
    <div style={navStyle}>
      {renderNavigation()}
      <div style={rightSectionStyle}>
        <button style={logoutButtonStyle} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navigation;