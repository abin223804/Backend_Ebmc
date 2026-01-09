
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import Admin from "../models/adminModel.js";

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const accessToken = jwt.sign(
    { adminId: admin._id, role: "admin" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { adminId: admin._id, role: "admin" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({ accessToken });
};

const refreshAdminToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (decoded.role !== "admin") return res.sendStatus(403);

    const adminExists = await Admin.findById(decoded.adminId);
    if (!adminExists) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      { adminId: decoded.adminId, role: "admin" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken: newAccessToken });
  } catch {
    return res.sendStatus(403);
  }
};

const adminLogout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.sendStatus(204);
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    // Prevent email enumeration
    return res.json({ message: "If email exists, OTP sent." });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP before storing
  admin.resetOtpHash = await bcrypt.hash(otp, 10);
  admin.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  await admin.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: admin.email,
    subject: "Admin Password Reset OTP",
    html: `
      <p>Your password reset OTP is:</p>
      <h2>${otp}</h2>
      <p>This OTP expires in 5 minutes.</p>
      <p>If you didn’t request this, ignore this email.</p>
    `,
  });

  return res.json({ message: "OTP sent to registered email." });
};




const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const admin = await Admin.findOne({
    email,
    resetOtpExpiry: { $gt: Date.now() },
  });

  if (!admin) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const isOtpValid = await bcrypt.compare(otp, admin.resetOtpHash);
  if (!isOtpValid) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 10);

  admin.resetOtpHash = undefined;
  admin.resetOtpExpiry = undefined;

  await admin.save();

  return res.json({ message: "Password reset successful" });
};

export {
  adminLogin,
  refreshAdminToken,
  adminLogout,
  forgotPassword,
  resetPassword,
};
