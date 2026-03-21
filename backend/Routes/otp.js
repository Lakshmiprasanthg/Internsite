const express = require("express");
const router = express.Router();
const axios = require("axios");
const Otp = require("../Model/Otp");

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email via Brevo API
const sendEmailViaBrevo = async (to, subject, htmlContent) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const data = {
    sender: {
      name: "Internsite",
      email: "noreply@internsite.com",
    },
    to: [
      {
        email: to,
      },
    ],
    subject: subject,
    htmlContent: htmlContent,
  };

  try {
    const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to send email"
    );
  }
};

// Send OTP to user email
router.post("/send", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if Brevo API key is configured
    if (!process.env.BREVO_API_KEY) {
      return res.status(500).json({ error: "Email service not configured" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save new OTP to database
    await Otp.create({
      email: email.toLowerCase(),
      otp,
    });

    // Prepare email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px;">
          <h2 style="color: #333;">Email Verification</h2>
          <p style="color: #666;">You requested to change your website language. Use the following verification code to proceed:</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0066cc; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666;">This code expires in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `;

    // Send email via Brevo API
    await sendEmailViaBrevo(
      email,
      "Your Internsite Language Change Verification Code",
      htmlContent
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({
      error: "Failed to send OTP: " + error.message,
    });
  }
});

// Verify OTP
router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    // Find matching OTP record
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Delete OTP after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      error: "Failed to verify OTP. Please try again.",
    });
  }
});

module.exports = router;
