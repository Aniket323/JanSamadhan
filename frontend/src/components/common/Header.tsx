import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MessagePopup from "./MessagePopup";
import { buttonStyle } from "../styles/common";
import { FiMenu, FiX } from "react-icons/fi"; // npm install react-icons

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated: string | null = localStorage.getItem("isAuthenticated");

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = useCallback(() => {
    localStorage.clear();
    setShowLogoutConfirm(false);
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const validateSession = async () => {
      const role = localStorage.getItem("userType");

      const endpointMap: Record<string, string> = {
        citizen: "/api/checkUserSession",
        officer: "/api/checkOfficerSession",
        admin: "/api/checkAdminSession",
      };

      const endpoint = role ? endpointMap[role] : undefined;
      if (!endpoint) return confirmLogout();

      try {
        const res = await fetch(
          `https://citizen-grivance-system.onrender.com${endpoint}`,
          { method: "GET", credentials: "include" }
        );
        if (res.status !== 200) confirmLogout();
      } catch (err) {
        console.error("Session validation failed:", err);
        confirmLogout();
      }
    };

    if (isAuthenticated) validateSession();
  }, [isAuthenticated, confirmLogout]);

  return (
    <div
      style={{
        width: "100%",
        height: "auto",
        background: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <div
          onClick={() => navigate("/")}
          style={{
            fontSize: 22,
            fontWeight: "bold",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Citizen Grievance Portal
        </div>

        {/* Desktop buttons */}
        <div
          style={{
            display: "none",
            gap: 16,
            alignItems: "center",
          }}
          className="desktop-only"
        >
          {!isAuthenticated && (
            <>
              <button
                onClick={() => navigate("/officer/login")}
                style={buttonStyle}
              >
                Officer Login
              </button>
              <button
                onClick={() => navigate("/citizen/login")}
                style={buttonStyle}
              >
                Citizen Login
              </button>
            </>
          )}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              style={{ ...buttonStyle, background: "#dc3545" }}
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ display: "block", fontSize: 24, cursor: "pointer" }}
          className="mobile-only"
        >
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "10px 20px",
            borderTop: "1px solid #ddd",
          }}
          className="mobile-only"
        >
          {!isAuthenticated && (
            <>
              <button
                onClick={() => {
                  navigate("/officer/login");
                  setIsMenuOpen(false);
                }}
                style={{ ...buttonStyle, width: "100%" }}
              >
                Officer Login
              </button>
              <button
                onClick={() => {
                  navigate("/citizen/login");
                  setIsMenuOpen(false);
                }}
                style={{ ...buttonStyle, width: "100%" }}
              >
                Citizen Login
              </button>
            </>
          )}
          {isAuthenticated && (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              style={{ ...buttonStyle, background: "#dc3545", width: "100%" }}
            >
              Logout
            </button>
          )}
        </div>
      )}

      {showLogoutConfirm && (
        <MessagePopup
          message="Are you sure you want to logout?"
          onClose={() => setShowLogoutConfirm(false)}
          showConfirm={true}
          onConfirm={confirmLogout}
        />
      )}

      {/* Basic media query with inline CSS using className */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-only { display: flex !important; }
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Header;
