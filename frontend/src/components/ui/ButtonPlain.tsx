import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const Button: React.FC<ButtonProps> = ({ variant = "default", style, ...props }) => {
  const baseStyle: React.CSSProperties = {
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 500,
    border: variant === "outline" ? "1px solid #ccc" : "none",
    background: variant === "outline" ? "transparent" : "#2563eb",
    color: variant === "outline" ? "#2563eb" : "#fff",
    transition: "all 0.2s ease",
  };

  return <button {...props} style={{ ...baseStyle, ...style }} />;
};
