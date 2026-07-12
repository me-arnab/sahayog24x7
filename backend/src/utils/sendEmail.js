const nodemailer = require("nodemailer");

console.log("Initializing Nodemailer SMTP transporter...");
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.warn("=== [Nodemailer Configuration Warning] ===");
  console.warn("EMAIL_USER or EMAIL_PASS environment variables are not set.");
  console.warn("Emails will fail to send in production.");
  console.warn("==========================================");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/**
 * Send an email using the pre-configured transporter
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} [options.from] - Sender info
 * @param {string} [options.replyTo] - Reply-to email
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 */
const sendEmail = async (options) => {
  console.log("--- [sendEmail Utility: Dispatch Start] ---");
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  
  if (!emailUser || !emailPass) {
    const errorMsg = "Cannot send email: EMAIL_USER or EMAIL_PASS environment variables are missing.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const mailOptions = {
    from: options.from || `"Sahayog24x7 Support" <${emailUser}>`,
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    console.log("Sending email via SMTP pool...");
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    console.log("--- [sendEmail Utility: Dispatch Success] ---");
    return info;
  } catch (error) {
    console.error("Email dispatch failed:", error);
    console.error("--- [sendEmail Utility: Dispatch Failed] ---");
    throw error;
  }
};

module.exports = sendEmail;
