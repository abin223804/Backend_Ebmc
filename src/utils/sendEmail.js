import nodemailer from "nodemailer";
import logger from "./logger.js"; 


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    logger.error("Email transporter initialization failed", error);
  } else {
    logger.info("Email transporter ready");
  }
});

/**
 * ======================
 * GENERIC SEND FUNCTION
 * ======================
 */
const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Security Alert" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html
    });

    logger.info("Email sent", { to, subject });
  } catch (error) {
    // Do NOT crash the app
    logger.error("Email send failed", {
      to,
      subject,
      error: error.message
    });
  }
};

/**
 * ======================
 * OTP EMAIL
 * ======================
 */
export const sendOtpEmail = async ({ to, otp }) => {
  return sendMail({
    to,
    subject: "Admin Password Reset OTP",
    html: `
      <p>Your password reset OTP is:</p>
      <h2 style="letter-spacing:4px;">${otp}</h2>
      <p>This OTP expires in <b>5 minutes</b>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `
  });
};

/**
 * ======================
 * LOGIN ALERT EMAIL
 * ======================
 */
export const sendLoginAlertEmail = async ({
  to,
  ipAddress,
  userAgent
}) => {
  return sendMail({
    to,
    subject: "New Login Detected",
    html: `
      <p>A new login was detected on your account.</p>
      <p><b>IP Address:</b> ${ipAddress}</p>
      <p><b>Device:</b> ${userAgent}</p>
      <p>If this wasn’t you, please logout all sessions immediately.</p>
    `
  });
};
