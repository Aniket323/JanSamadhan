import React, { useState, FormEvent, ChangeEvent, FC } from "react";
import { useNavigate } from "react-router-dom";
import { pageContainer, mainContentStyle } from "../styles/layout";
import { inputStyle, buttonStyle } from "../styles/common";
import Header from "../../components/common/Header";
import MessagePopup from "../../components/common/MessagePopup";

// --- Type Definitions for API Response ---

interface User {
  name: string;
  email: string;
}

interface LoginResponse {
  userType: "admin" | "officer";
  user: User;
  message?: string; // Optional success message
}

// --- Component Definition ---

const OfficerLogin: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);

    if (!email || !password) {
      setMessage("Please fill in all fields");
      setShowMessage(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://citizen-grivance-system.onrender.com/api/officer/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important for session cookies
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Use the message from the API response, or a default one
        throw new Error(
          data.message || "Login failed due to an unknown error."
        );
      }

      const responseData = data as LoginResponse;

      // Store user info in localStorage
      localStorage.setItem("userType", responseData.userType);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userName", responseData.user.name);
      localStorage.setItem("userEmail", responseData.user.email);

      // Navigate based on user type
      if (responseData.userType === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/officer/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setMessage(error.message || "Login failed. Please try again.");
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainer}>
      <Header />
      <div style={mainContentStyle}>
        <div
          style={{
            maxWidth: 400,
            margin: "0 auto",
            padding: "40px",
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>
            Officer/Admin Login
          </h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="email"
                style={{ display: "block", marginBottom: 8 }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                style={inputStyle}
                placeholder="Enter your email"
                disabled={loading}
              />
              <small style={{ color: "#666", fontSize: "12px" }}>
                Email should contain @
              </small>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="password"
                style={{ display: "block", marginBottom: 8 }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                style={inputStyle}
                placeholder="Enter your password"
                disabled={loading}
              />
              <small style={{ color: "#666", fontSize: "12px" }}>
                Password must 8 digit consisting 1 Capital Letter 1 numerical value and 1 special character
              </small>
            </div>

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <a href="/" style={{ color: "#007bff", textDecoration: "none" }}>
              Back to Home
            </a>
          </div>
        </div>
      </div>
      {showMessage && (
        <MessagePopup message={message} onClose={() => setShowMessage(false)} />
      )}
    </div>
  );
};

export default OfficerLogin;
