import React from "react";

interface CardProps {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ icon, title, children }) => {
  const cardStyle: React.CSSProperties = {
    padding: "20px",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };

  const iconStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    color: "#2563eb",
    marginBottom: "10px",
  };

  return (
    <div style={cardStyle}>
      {icon && <div style={iconStyle}>{icon}</div>}
      <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{title}</h3>
      <p style={{ color: "#666", marginTop: "8px" }}>{children}</p>
    </div>
  );
};
