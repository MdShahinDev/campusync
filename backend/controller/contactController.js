const { validationResult } = require("express-validator");
const ContactMessage = require("../model/ContactMessage");

exports.submitContactMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { name, email, subject, message } = req.body;

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      userId: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon.",
      data: { id: contactMessage._id },
    });
  } catch (error) {
    console.error("SubmitContactMessage error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};
