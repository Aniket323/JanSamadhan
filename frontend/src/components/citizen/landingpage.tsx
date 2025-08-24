import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery"; // ADDED: Import the hook

// Assuming these styles are correctly typed as React.CSSProperties
import { pageContainer } from "../styles/layout";
import { inputStyle, buttonStyle } from "../styles/common";
import Header from "../common/Header";
import Footer from "../common/Footer";

// --- Style Definitions for Responsiveness ---

// Hero Section
const baseHeroHeadingStyle: React.CSSProperties = {
  fontSize: 48,
  fontFamily: "Roboto, sans-serif",
  fontWeight: 700,
  marginBottom: 20,
  maxWidth: 600,
};
const mobileHeroHeadingStyle: React.CSSProperties = {
  fontSize: 34,
  maxWidth: "100%",
};
const heroButtonsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  gap: 12,
  marginTop: 16,
};
const mobileHeroButtonsStyle: React.CSSProperties = {
  flexDirection: "column",
  width: "100%",
  alignItems: "center",
  gap: 12,
};

// Track Section
const baseTrackContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "50px",
  padding: "60px",
  backgroundColor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
  margin: "60px auto",
  maxWidth: "1100px",
  flexWrap: "wrap-reverse",
  justifyContent: "space-between",
};
const mobileTrackContainerStyle: React.CSSProperties = {
  flexDirection: "column",
  padding: "30px 20px",
  margin: "30px 15px",
  gap: "30px",
};

const baseTrackHeadingStyle: React.CSSProperties = {
  fontSize: "42px",
  fontFamily: "Roboto, sans-serif",
  fontWeight: 700,
  margin: "0 0 10px 0",
  color: "#212529",
};
const mobileTrackHeadingStyle: React.CSSProperties = { fontSize: "32px" };

const baseTrackFormActionStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};
const mobileTrackFormActionStyle: React.CSSProperties = {
  flexDirection: "column",
  width: "100%",
  gap: "12px",
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState<string>("");
  const trackingInputRef = useRef<HTMLInputElement>(null);

  // ADDED: Hook to detect if the screen is mobile-sized
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isAuthenticated: string | null =
    localStorage.getItem("isAuthenticated");

  // --- Combine styles based on screen size ---
  const heroHeadingStyle = {
    ...baseHeroHeadingStyle,
    ...(isMobile ? mobileHeroHeadingStyle : {}),
  };
  const dynamicHeroButtonsStyle = {
    ...heroButtonsStyle,
    ...(isMobile ? mobileHeroButtonsStyle : {}),
  };
  const trackContainerStyle = {
    ...baseTrackContainerStyle,
    ...(isMobile ? mobileTrackContainerStyle : {}),
  };
  const trackHeadingStyle = {
    ...baseTrackHeadingStyle,
    ...(isMobile ? mobileTrackHeadingStyle : {}),
  };
  const trackFormActionStyle = {
    ...baseTrackFormActionStyle,
    ...(isMobile ? mobileTrackFormActionStyle : {}),
  };

  const handleTrackClick = (): void => {
    if (trackingId) {
      navigate(`/track/${trackingId}`);
    }
  };

  const handleScrollToTrackInput = (): void => {
    trackingInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    trackingInputRef.current?.focus();
  };

  return (
    <div style={pageContainer}>
      <Header />

      {/* Hero Section */}
      <div
        style={{
          width: "100%",
          minHeight: "40vh",
          background: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6))",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1 style={heroHeadingStyle}>
          Welcome to the Jan Samadhan Portal
        </h1>
        <p
          style={{
            fontSize: isMobile ? 16 : 18,
            maxWidth: isMobile ? "100%" : 520,
            marginBottom: 24,
          }}
        >
          Easily submit and track your grievances to ensure your voice is heard.
        </p>

        {/* CHANGED: This container is now responsive */}
        <div style={dynamicHeroButtonsStyle}>
          {!isAuthenticated ? (
            <>
              <button
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  border: "1px solid white",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "16px",
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={handleScrollToTrackInput}
              >
                Track Grievance
              </button>
              <button
                style={{
                  ...buttonStyle,
                  fontSize: "16px",
                  width: isMobile ? "100%" : "auto",
                }}
                onClick={() => navigate("/citizen/login")}
              >
                Submit Grievance
              </button>
            </>
          ) : (
            <button
              style={{
                ...buttonStyle,
                fontSize: "16px",
                width: isMobile ? "100%" : "auto",
              }}
              onClick={() => navigate("/submit")}
            >
              Submit New Grievance
            </button>
          )}
        </div>
      </div>

      {/* Redesigned Track Section */}
      <div style={trackContainerStyle}>
        {/* Form Column */}
        <div style={{ flex: 1, width: isMobile ? "100%" : "50%" }}>
          <h2 style={trackHeadingStyle}>Track Your Grievance</h2>
          <p
            style={{ fontSize: "18px", color: "#6c757d", marginBottom: "30px" }}
          >
            Enter your tracking ID to see real-time updates on your submitted
            complaint.
          </p>
          <div style={trackFormActionStyle}>
            <input
              ref={trackingInputRef}
              type="text"
              placeholder="Enter Your Tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              style={{
                ...inputStyle,
                flex: isMobile ? "none" : 1,
                width: isMobile ? "100%" : "auto",
                fontSize: "16px",
                padding: "16px",
                border: "1px solid #ced4da",
                borderRadius: "8px",
              }}
            />
            <button
              style={{
                ...buttonStyle,
                fontSize: "16px",
                fontWeight: "bold",
                padding: "16px 32px",
                borderRadius: "8px",
                width: isMobile ? "100%" : "auto",
              }}
              onClick={handleTrackClick}
            >
              Track Status
            </button>
          </div>
        </div>
        {/* Image Column */}
        <div
          style={{
            flex: 1,
            width: isMobile ? "100%" : "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/track-illustration.png"
            alt="Illustration of a magnifying glass over a progress bar"
            style={{ maxWidth: "100%", height: "auto", maxHeight: "280px" }}
          />
        </div>
      </div>

      {/* How It Works Section */}
<div
  style={{
    padding: "60px 20px",
    backgroundColor: "#f8f9fa",
    textAlign: "center",
  }}
>
  <h2 style={{ fontSize: 36, marginBottom: 10, color: "#212529" }}>
    How It Works
  </h2>
  <p style={{ fontSize: 18, color: "#6c757d", marginBottom: 40 }}>
    A simple 3-step process to get your grievances resolved efficiently.
  </p>

  <div
    style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "center",
      gap: 30,
    }}
  >
    {[
      { title: "1. Submit", desc: "Raise a complaint in minutes", icon: "📝" },
      { title: "2. Track", desc: "Get live updates", icon: "📊" },
      { title: "3. Resolve", desc: "Receive timely action", icon: "✅" },
    ].map((step, index) => (
      <div
        key={index}
        style={{
          backgroundColor: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          flex: 1,
          minWidth: isMobile ? "100%" : "250px",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 16 }}>{step.icon}</div>
        <h3 style={{ marginBottom: 8, color: "#343a40" }}>{step.title}</h3>
        <p style={{ color: "#6c757d" }}>{step.desc}</p>
      </div>
    ))}
  </div>
</div>

{/* Why Use Our Portal Section */}
<div
  style={{
    padding: "60px 20px",
    backgroundColor: "#ffffff",
    textAlign: "center",
  }}
>
  <h2 style={{ fontSize: 36, marginBottom: 10, color: "#212529" }}>
    Why Use Our Portal?
  </h2>
  <p style={{ fontSize: 18, color: "#6c757d", marginBottom: 40 }}>
    Built with transparency, speed, and accessibility in mind.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: 20,
      maxWidth: 900,
      margin: "auto",
    }}
  >
    {[
      {
        icon: "🔐",
        title: "Secure & Transparent",
        desc: "Your data is protected and your voice is heard.",
      },
      {
        icon: "📡",
        title: "Real-Time Tracking",
        desc: "Stay informed with timely updates.",
      },
      {
        icon: "🏢",
        title: "Department-Wise Handling",
        desc: "Complaints go straight to the relevant department.",
      },
      {
        icon: "👥",
        title: "Citizens First",
        desc: "We prioritize citizen satisfaction and ease.",
      },
    ].map((tile, idx) => (
      <div
        key={idx}
        style={{
          border: "1px solid #dee2e6",
          borderRadius: 12,
          padding: 24,
          textAlign: "left",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div style={{ fontSize: 28 }}>{tile.icon}</div>
        <h3 style={{ marginTop: 12, color: "#343a40" }}>{tile.title}</h3>
        <p style={{ color: "#6c757d", marginTop: 4 }}>{tile.desc}</p>
      </div>
    ))}
  </div>
</div>


      <Footer />
    </div>
  );
};

export default LandingPage;
