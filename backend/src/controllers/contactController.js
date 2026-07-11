const ContactMessage = require("../models/ContactMessage");

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
