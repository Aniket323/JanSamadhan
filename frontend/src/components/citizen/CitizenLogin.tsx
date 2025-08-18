import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pageContainer, mainContentStyle } from "../styles/layout";
import { labelStyle, inputStyle, buttonStyle } from "../styles/common";
import Header from "../../components/common/Header";
import MessagePopup from "../../components/common/MessagePopup";

// --- Interfaces for API Responses ---
// Defines the expected shape of the JSON response from the send-otp endpoint.
interface SendOtpResponse {
  message: string;
}

// Defines the expected shape of the JSON response from the verify-otp endpoint.
interface VerifyOtpResponse {
  message: string;
}

const CitizenLogin: React.FC = () => {
  const navigate = useNavigate();

  // --- State Management with Types ---
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [showOtpField, setShowOtpField] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false);

  // --- Typed Functions ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showMessagePopup = (msg: string): void => {
    setMessage(msg);
    setShowMessage(true);
  };

  const generateOtp = async (): Promise<void> => {
    if (!email || !validateEmail(email)) {
      showMessagePopup("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(
        "https://citizen-grivance-system.onrender.com/api/auth/send-otp",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      // Assert the type of the JSON response
      const data = (await response.json()) as SendOtpResponse;

      if (response.ok && data.message === "OTP sent successfully") {
        setShowOtpField(true);
        showMessagePopup("An OTP has been sent to your email.");
      } else {
        showMessagePopup(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("OTP generation error:", error);
      showMessagePopup("Failed to generate OTP. Please try again.");
    }
  };

  const handleLogin = async (): Promise<void> => {
    try {
      const response = await fetch(
        "https://citizen-grivance-system.onrender.com/api/auth/verify-otp",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      // Assert the type of the JSON response
      const data = (await response.json()) as VerifyOtpResponse;

      if (response.ok && data.message === "Login successful") {
        localStorage.setItem("userType", "citizen");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userName", email);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("citizenEmail", email);
        navigate("/citizen/dashboard");
      } else {
        showMessagePopup(data.message || "Invalid OTP or email.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessagePopup("Login failed. Please try again.");
    }
  };

  return (
    <div style={pageContainer}>
      {showMessage && (
        <MessagePopup message={message} onClose={() => setShowMessage(false)} />
      )}
      <Header />
      <div style={{ ...mainContentStyle, maxWidth: 400, margin: "40px auto" }}>
        <h1 style={{ fontSize: 32, fontFamily: "Roboto", fontWeight: 700, marginBottom: 32 }}>
          Citizen Login
        </h1>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Email Address*</label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="email"
                placeholder="Enter your Email"
                value={email}
                // The event 'e' is correctly typed here
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={generateOtp}
                style={{ ...buttonStyle, padding: "10px 15px", background: "#555" }}
                disabled={!email}
              >
                Get OTP
              </button>
            </div>
          </div>
          {showOtpField && (
            <div>
              <label style={labelStyle}>OTP*</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={handleLogin}
                  style={{ ...buttonStyle, padding: "10px 15px" }}
                  disabled={!otp}
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{ ...buttonStyle, background: "#666", width: 200 }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { pageContainer, mainContentStyle } from "../styles/layout";
// import { labelStyle, inputStyle, buttonStyle } from "../styles/common";
// import Header from "../../components/common/Header";
// import MessagePopup from "../../components/common/MessagePopup";
// import ReCAPTCHA from "react-google-recaptcha";

// // --- Interfaces for API Responses ---
// interface SendOtpResponse {
//   message: string;
// }
// interface VerifyOtpResponse {
//   message: string;
// }

// const CitizenLogin: React.FC = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState<string>("");
//   const [otp, setOtp] = useState<string>("");
//   const [showOtpField, setShowOtpField] = useState<boolean>(false);
//   const [message, setMessage] = useState<string>("");
//   const [showMessage, setShowMessage] = useState<boolean>(false);
//   const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);

//   const validateEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const showMessagePopup = (msg: string): void => {
//     setMessage(msg);
//     setShowMessage(true);
//   };

//   const generateOtp = async (): Promise<void> => {
//     if (!email || !validateEmail(email)) {
//       showMessagePopup("Please enter a valid email address.");
//       return;
//     }

//     if (!captchaVerified) {
//       showMessagePopup("Please verify the CAPTCHA.");
//       return;
//     }

//     try {
//       const response = await fetch(
//         "https://citizen-grivance-system.onrender.com/api/auth/send-otp",
//         {
//           method: "POST",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email }),
//         }
//       );
//       const data = (await response.json()) as SendOtpResponse;

//       if (response.ok && data.message === "OTP sent successfully") {
//         setShowOtpField(true);
//         showMessagePopup("An OTP has been sent to your email.");
//       } else {
//         showMessagePopup(data.message || "Failed to send OTP.");
//       }
//     } catch (error) {
//       console.error("OTP generation error:", error);
//       showMessagePopup("Failed to generate OTP. Please try again.");
//     }
//   };

//   const handleLogin = async (): Promise<void> => {
//     try {
//       const response = await fetch(
//         "https://citizen-grivance-system.onrender.com/api/auth/verify-otp",
//         {
//           method: "POST",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, otp }),
//         }
//       );
//       const data = (await response.json()) as VerifyOtpResponse;

//       if (response.ok && data.message === "Login successful") {
//         localStorage.setItem("userType", "citizen");
//         localStorage.setItem("isAuthenticated", "true");
//         localStorage.setItem("userName", email);
//         localStorage.setItem("userEmail", email);
//         localStorage.setItem("citizenEmail", email);
//         navigate("/citizen/dashboard");
//       } else {
//         showMessagePopup(data.message || "Invalid OTP or email.");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       showMessagePopup("Login failed. Please try again.");
//     }
//   };

//   return (
//     <div style={pageContainer}>
//       {showMessage && (
//         <MessagePopup message={message} onClose={() => setShowMessage(false)} />
//       )}
//       <Header />
//       <div style={{ ...mainContentStyle, maxWidth: 400, margin: "40px auto" }}>
//         <h1 style={{ fontSize: 32, fontFamily: "Roboto", fontWeight: 700, marginBottom: 32 }}>
//           Citizen Login
//         </h1>
//         <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
//           <div>
//             <label style={labelStyle}>Email Address*</label>
//             <div style={{ display: "flex", gap: 10 }}>
//               <input
//                 type="email"
//                 placeholder="Enter your Email"
//                 value={email}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
//                 style={{ ...inputStyle, flex: 1 }}
//               />
//               <button
//                 onClick={generateOtp}
//                 style={{ ...buttonStyle, padding: "10px 15px", background: "#555" }}
//                 disabled={!email}
//               >
//                 Get OTP
//               </button>
//             </div>
//           </div>

//           {/* --- CAPTCHA Section --- */}
//           <div>
//             <ReCAPTCHA
//               sitekey="6Lee_5IrAAAAAPeHiB9LKRx7wKn-r0Dj8efFtZhk"
//               onChange={() => setCaptchaVerified(true)}
//               onExpired={() => setCaptchaVerified(false)}
//             />
//           </div>

//           {showOtpField && (
//             <div>
//               <label style={labelStyle}>OTP*</label>
//               <div style={{ display: "flex", gap: 10 }}>
//                 <input
//                   type="text"
//                   placeholder="Enter OTP"
//                   value={otp}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
//                   style={{ ...inputStyle, flex: 1 }}
//                 />
//                 <button
//                   onClick={handleLogin}
//                   style={{ ...buttonStyle, padding: "10px 15px" }}
//                   disabled={!otp}
//                 >
//                   Login
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//         <div style={{ marginTop: 40, textAlign: "center" }}>
//           <button
//             onClick={() => navigate("/")}
//             style={{ ...buttonStyle, background: "#666", width: 200 }}
//           >
//             Back to Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CitizenLogin;
