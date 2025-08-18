import React, { useState } from "react";
import Modal from "./Modal";

import { useMediaQuery } from "../hooks/useMediaQuery";

const modalContent = {
  contact: {
    title: "Contact Us",
    content: (
      <>
        <h2>Email: </h2>
        <p>citizen.grievance@gmail.com</p>
      </>
    ),
  },
  faq: {
    title: "Frequently Asked Questions",
    content: (
      <>
        <h2>What is the Citizen Grievance Portal?</h2>
        <p>
          This portal is an online platform that allows citizens to register and
          track civic-related issues such as potholes, garbage collection,
          broken streetlights, and water supply problems directly with the
          concerned municipal departments.
        </p>

        <h2>How do I submit a grievance?</h2>
        <p>
          Simply log in to your account, click on the "Submit New Grievance"
          button, fill in the required details including the location and a
          description of the issue, attach a photo if possible, and submit the
          form.
        </p>

        <h2>How can I track the status of my grievance?</h2>
        <p>
          After submission, you will receive a unique Tracking ID. You can enter
          this ID on the homepage to see the current status of your complaint,
          which can be 'Pending', 'In Progress', or 'Resolved'.
        </p>

        <h2>Is there a cost to use this service?</h2>
        <p>No, this service is completely free for all citizens.</p>
      </>
    ),
  },
  terms: {
    title: "Terms of Service",
    content: (
      <>
        <h2>1. User Conduct</h2>
        <p>
          Users agree to provide accurate and truthful information when
          submitting a grievance. The submission of false, misleading, abusive,
          or malicious complaints is strictly prohibited and may result in
          account suspension.
        </p>

        <h2>2. Scope of Service</h2>
        <p>
          This portal acts as a facilitator between the citizen and the relevant
          government department. We do not guarantee the resolution of any
          grievance but ensure that it is forwarded to the responsible authority
          for action.
        </p>

        <h2>3. Limitation of Liability</h2>
        <p>
          The platform is not liable for any delays in the resolution of
          grievances or for any damages resulting from the issues reported. The
          responsibility for addressing the grievance lies with the respective
          government department.
        </p>

        <h2>4. Account Termination</h2>
        <p>
          We reserve the right to suspend or terminate user accounts that
          violate these terms of service without prior notice.
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    content: (
      <>
        <h2>1. Information We Collect</h2>
        <p>
          We collect personal information such as your{" "}
          <strong>email address</strong> for registration and communication. We
          also collect grievance details, including{" "}
          <strong>location data and photographs</strong> you provide.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>Your information is used to:</p>
        <ul>
          <li>Register and manage your account.</li>
          <li>Forward your grievance to the correct municipal department.</li>
          <li>Provide you with status updates regarding your complaint.</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>
          Your grievance details, including Email information, are shared only
          with the relevant government departments responsible for resolution.{" "}
          <strong>
            We will not sell or share your personal data with third-party
            marketers.
          </strong>
        </p>

        <h2>4. Data Security</h2>
        <p>
          We are committed to protecting your data. We implement
          industry-standard security measures to prevent unauthorized access,
          disclosure, or alteration of your information.
        </p>
      </>
    ),
  },
};

const footerContainerStyle: React.CSSProperties = {
  width: "100%",
  padding: "30px 20px",
  background: "#f8f9fa",
  borderTop: "1px solid #dee2e6",
  marginTop: "auto",
};

const baseFooterContentStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "40px",
  flexWrap: "wrap",
};

const mobileFooterContentStyle: React.CSSProperties = {
  flexDirection: "column",
  gap: "20px",
};

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<
    keyof typeof modalContent | null
  >(null);

  const isMobile = useMediaQuery("(max-width: 600px)");
  const footerContentStyle = {
    ...baseFooterContentStyle,
    ...(isMobile ? mobileFooterContentStyle : {}),
  };

  const buttonLinkStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontSize: "16px",
    color: "#495057",
  };

  return (
    <>
      <footer style={footerContainerStyle}>
        <div style={footerContentStyle}>
          <button
            onClick={() => setActiveModal("contact")}
            style={buttonLinkStyle}
          >
            Contact Us
          </button>
          <button onClick={() => setActiveModal("faq")} style={buttonLinkStyle}>
            FAQs
          </button>
          <button
            onClick={() => setActiveModal("terms")}
            style={buttonLinkStyle}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveModal("privacy")}
            style={buttonLinkStyle}
          >
            Privacy Policy
          </button>
        </div>
      </footer>

      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={activeModal ? modalContent[activeModal].title : ""}
      >
        {activeModal ? modalContent[activeModal].content : null}
      </Modal>
    </>
  );
};

export default Footer;
