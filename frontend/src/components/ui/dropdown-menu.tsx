import React, { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
  style?: React.CSSProperties;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

// Main Dropdown Menu
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <div style={{ position: "relative", display: "inline-block" }}>{children}</div>;
};

// Trigger Button
export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  onClick,
}) => {
  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      {children}
    </div>
  );
};

// Dropdown Content
export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  open = false,
  onClose,
  style,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "8px 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        zIndex: 999,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Dropdown Item
export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  style,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "8px 16px",
        cursor: "pointer",
        transition: "background 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {children}
    </div>
  );
};
