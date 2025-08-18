import React, { useState, useRef, useEffect, ChangeEvent, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { pageContainer, mainContentStyle } from "../styles/layout";
import { labelStyle, inputStyle, buttonStyle } from "../styles/common";
import Header from "../../components/common/Header";
import MessagePopup from "../../components/common/MessagePopup";

// ### Type Definitions ###

// Describes the structure of the form's state
interface GrievanceFormState {
  category: string;
  title: string;
  description: string;
  street: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  file: File | null;
}

// ### Component ###

const GrievanceSubmission: React.FC = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  // State with explicit types
  const [message, setMessage] = useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [form, setForm] = useState<GrievanceFormState>({
    category: "",
    title: "",
    description: "",
    street: "",
    city: "",
    district: "",
    state: "",
    postalCode: "",
    file: null,
  });
  const [step, setStep] = useState<number>(1);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [trackingId, setTrackingId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


  // Create refs with explicit element types
  const categoryRef = useRef<HTMLSelectElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const districtRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in as a citizen
  useEffect(() => {
    if (!isAuthenticated || userType !== "citizen") {
      navigate("/citizen/login");
    }
  }, [isAuthenticated, userType, navigate]);


  const showMessagePopup = (msg: string): void => {
    setMessage(msg);
    setShowMessage(true);
  };

  // Generic handler for text input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm(prevForm => ({
          ...prevForm,
          [name]: value
      }));
  };

  // Handler for file input changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setForm(prevForm => ({ ...prevForm, file: e.target.files![0] }));
      }
  };


  const validateForm = (): boolean => {
    const fields: {
      key: keyof GrievanceFormState;
      ref: React.RefObject<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null
      >;
      message: string;
      condition?: boolean;
    }[] = [
      {
        key: "category",
        ref: categoryRef,
        message: "Please select a category.",
      },
      { key: "title", ref: titleRef, message: "A clear title is required." },
      {
        key: "description",
        ref: descriptionRef,
        message: "A detailed description is necessary.",
      },
      {
        key: "street",
        ref: streetRef,
        message: "Street address is required for location.",
      },
      {
        key: "city",
        ref: cityRef,
        message: "City is required for jurisdiction.",
      },
      {
        key: "district",
        ref: districtRef,
        message: "District helps in coordinating with authorities.",
      },
      {
        key: "state",
        ref: stateRef,
        message: "State is required for proper routing.",
      },
      {
        key: "postalCode",
        ref: postalCodeRef,
        message: "A valid 6-digit postal code is required.",
        condition: form.postalCode.length !== 6,
      },
    ];

    for (const field of fields) {
      if (!form[field.key] || field.condition) {
        field.ref.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        showMessagePopup(field.message);
        return false;
      }
    }

    return true;
  };


  const handleSubmitClick = (): void => {
    if (validateForm()) {
      setShowConfirm(true);
    }
  };

  const handleFinalSubmit = async (): Promise<void> => {
    setShowConfirm(false);
    setIsSubmitting(true);

    const location = {
      state: form.state,
      district: form.district,
      city: form.city,
      addressLine: form.street,
      pincode: form.postalCode,
    };

    const formData = new FormData();
    formData.append("category", form.category);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("location", JSON.stringify(location));
    if (form.file) {
      formData.append("attachments", form.file);
    }

    try {
      const response = await fetch(
        "https://citizen-grivance-system.onrender.com/api/complaints/submit",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTrackingId(data.grievanceId);
        setStep(2); // Move to success screen
      } else {
        showMessagePopup(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting grievance:", error);
      showMessagePopup("Server error. Please try again later.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || userType !== "citizen") {
    return null; // Render nothing while redirecting
  }

  return (
    <div style={pageContainer as CSSProperties}>
      <Header />

      <div
        style={{
          ...mainContentStyle,
          maxWidth: 800,
          margin: "20px auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "60px",
        } as CSSProperties}
      >
        <h1
          style={{
            fontSize: 40,
            fontFamily: "Roboto, sans-serif",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Submit Your Grievance
        </h1>
        <p
          style={{
            fontSize: 16,
            fontFamily: "Roboto, sans-serif",
            textAlign: "center",
            marginBottom: 40,
            color: '#6c757d'
          }}
        >
          Please fill out the form below to help us address your concerns.
        </p>

        {step === 1 ? (
          <div
            style={{
              width: "95%",
              maxWidth: 600,
              background: "white",
              padding: "30px",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {/* Category */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle as CSSProperties}>Category*</label>
              <select
                ref={categoryRef}
                name="category"
                value={form.category}
                onChange={handleInputChange}
                style={{ ...inputStyle, width: "100%" } as CSSProperties}
              >
                <option value="">Select a Category</option>
                <option value="Municipal Issues">Municipal Issues</option>
                <option value="Utility Services">Utility Services</option>
                <option value="Public Safety & Law Enforcement">Public Safety & Law Enforcement</option>
                <option value="Healthcare & Sanitation">Healthcare & Sanitation</option>
                <option value="Transport & Infrastructure">Transport & Infrastructure</option>
                <option value="Digital and Online Services">Digital and Online Services</option>
                <option value="Education & Youth Services">Education & Youth Services</option>
                <option value="Government Schemes & Services">Government Schemes & Services</option>
                
                
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle as CSSProperties}>Title*</label>
              <input
                ref={titleRef}
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                style={{ ...inputStyle, width: "100%" } as CSSProperties}
                placeholder="e.g., Unresolved Pothole on Main Street"
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle as CSSProperties}>Description*</label>
              <textarea
                ref={descriptionRef}
                name="description"
                value={form.description}
                onChange={handleInputChange}
                style={{
                  ...inputStyle,
                  width: "100%",
                  minHeight: 120,
                  resize: "vertical",
                } as CSSProperties}
                placeholder="Provide a detailed description of the issue..."
              />
            </div>
            
             {/* Address Fields */}
            <div style={{ marginBottom: 24 }}>
                <label style={labelStyle as CSSProperties}>Street Address*</label>
                <input ref={streetRef} type="text" name="street" value={form.street} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" } as CSSProperties} placeholder="Street and Area" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                    <label style={labelStyle as CSSProperties}>City*</label>
                    <input ref={cityRef} type="text" name="city" value={form.city} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" } as CSSProperties} placeholder="City" />
                </div>
                <div>
                    <label style={labelStyle as CSSProperties}>District*</label>
                    <input ref={districtRef} type="text" name="district" value={form.district} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" } as CSSProperties} placeholder="District" />
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                    <label style={labelStyle as CSSProperties}>State*</label>
                    <input ref={stateRef} type="text" name="state" value={form.state} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" } as CSSProperties} placeholder="State" />
                </div>
                <div>
                    <label style={labelStyle as CSSProperties}>Postal Code*</label>
                    <input ref={postalCodeRef} type="text" name="postalCode" value={form.postalCode} onChange={handleInputChange} style={{ ...inputStyle, width: "100%" } as CSSProperties} placeholder="6-digit PIN" maxLength={6} />
                </div>
            </div>


            {/* File Upload */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle as CSSProperties}>Supporting Documents (Optional)</label>
              <input
                type="file"
                name="attachments"
                onChange={handleFileChange}
                style={{ ...inputStyle, width: "100%", padding: '8px' } as CSSProperties}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Supported formats: PDF, JPG, PNG (max 5MB)
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 30 }}>
              <button
                onClick={() => navigate("/citizen/dashboard")}
                style={{ ...buttonStyle, background: "#6c757d" } as CSSProperties}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button onClick={handleSubmitClick} style={buttonStyle as CSSProperties} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
              </button>
            </div>
          </div>
        ) : (
          // Success Screen
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              maxWidth: 500,
              width: "95%",
            }}
          >
            <div
              style={{
                width: 60, height: 60, background: "#4CAF50", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <div style={{ fontSize: 30, color: "white" }}>✓</div>
            </div>
            <h2 style={{ fontFamily: "Roboto, sans-serif", fontSize: 28, marginBottom: 16, color: "#333" }}>
              Grievance Submitted!
            </h2>
            <div style={{ background: "#f8f8f8", padding: "15px", borderRadius: 8, marginBottom: 24 }}>
              <p style={{ margin: "0 0 8px 0", color: "#666" }}>Your Tracking ID is:</p>
              <p style={{ fontSize: 24, fontWeight: 600, margin: 0, color: "#000" }}>{trackingId}</p>
            </div>
            <p style={{ color: "#666", marginBottom: 24 }}>
              Please save this ID to check your grievance status later.
            </p>
            <button
              onClick={() => navigate("/citizen/dashboard")}
              style={{ ...buttonStyle, background: "#4CAF50" } as CSSProperties}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {showConfirm && (
        <MessagePopup
          message="Are you sure you want to submit this grievance?"
          onClose={() => setShowConfirm(false)}
          showConfirm={true}
          onConfirm={handleFinalSubmit}
        />
      )}

      {showMessage && (
        <MessagePopup message={message} onClose={() => setShowMessage(false)} />
      )}
    </div>
  );
};

export default GrievanceSubmission;
