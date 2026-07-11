const ContactMessage = require("../models/ContactMessage");
const nodemailer = require("nodemailer");

// @desc    Submit a contact us message
// @route   POST /api/contact/submit
// @access  Public
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const newMessage = await ContactMessage.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      subject: String(subject).trim(),
      message: String(message).trim(),
    });

    // Send email to admin
    try {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (emailUser && emailPass) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        const mailOptions = {
          from: `"Sahayog24x7 Contact Portal" <${emailUser}>`,
          to: "info.sahayog24x7@gmail.com",
          replyTo: email.trim(),
          subject: `New Contact Form Submission: ${subject.trim()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-top: 0;">New Support Request</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 100px;">Name:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${name.trim()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
                  <td style="padding: 8px 0; color: #3b82f6;"><a href="mailto:${email.trim()}" style="text-decoration: none; color: #3b82f6;">${email.trim()}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #475569;">Subject:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${subject.trim()}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <p style="margin-top: 0; font-weight: bold; color: #475569;">Message:</p>
                <p style="margin-bottom: 0; color: #0f172a; white-space: pre-wrap; line-height: 1.6;">${message.trim()}</p>
              </div>
              
              <p style="font-size: 11px; color: #94a3b8; margin-top: 25px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                This message was sent automatically from the Sahayog24x7 Contact Us portal.
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email forwarded to admin successfully.");
      } else {
        console.warn("=== [Nodemailer Config Missing] ===");
        console.warn("EMAIL_USER or EMAIL_PASS environment variables are not defined.");
        console.warn("The contact submission was saved to database, but admin email was skipped.");
        console.warn(`Forward destination: info.sahayog24x7@gmail.com`);
        console.warn(`Sender Name: ${name}`);
        console.warn(`Sender Email: ${email}`);
        console.warn(`Subject: ${subject}`);
        console.warn("==================================");
      }
    } catch (mailError) {
      console.error("Failed to forward contact form email to admin:", mailError.message);
      // We catch this to ensure database creation success response is still returned even if email dispatch fails.
    }

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error in submitMessage:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all contact us messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
