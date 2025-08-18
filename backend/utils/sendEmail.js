const Brevo = require('@getbrevo/brevo');
require('dotenv').config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API
);

const sendEmail = async ({ toEmail, subject, text }) => {
  const sender = { name: "Citizens Grievance System", email: "siddhi280921@gmail.com" };
  const receivers = [{ email: toEmail }];

  try {
    const response = await apiInstance.sendTransacEmail({
      sender,
      to: receivers,
      subject,
      textContent: text,
    });

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendComplaintConfirmation = async ({ to, grievanceId, title, category, description, location }) => {
  const { district, city, pincode, addressLine, state = "Maharashtra" } = location;

  const htmlContent = `
    <h2>Complaint Submitted Successfully</h2>
    <p><strong>Grievance ID:</strong> ${grievanceId}</p>
    <p><strong>Title:</strong> ${title}</p>
    <p><strong>Category:</strong> ${category}</p>
    <p><strong>Description:</strong> ${description}</p>
    <p><strong>Location:</strong> ${addressLine}, ${city}, ${district}, ${state} - ${pincode}</p>
    <br/>
    <p>You can use the Grievance ID to track the status of your complaint.</p>
  `;

  await apiInstance.sendTransacEmail({
    sender: { email: "siddhi280921@gmail.com", name: "Grievance Support" },
    to: [{ email: to }],
    subject: "Grievance Submitted: Your Complaint ID",
    htmlContent,
  });
};

module.exports = {
  sendEmail,
  sendComplaintConfirmation
};
