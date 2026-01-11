import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import hashToken from "../utils/hashToken.js";
import { sendOtpEmail } from "../utils/sendEmail.js";
import { sendLoginAlertEmail } from "../utils/sendEmail.js";





export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Find admin
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  // 2️⃣ Verify password
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  // 3️⃣ Generate tokens
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

  // 4️⃣ Create session
  admin.sessions.push({
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  await admin.save();

  // 5️⃣ Send login alert email (non-blocking)
  await sendLoginAlertEmail({
    to: admin.email,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  // 6️⃣ Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });

  // 7️⃣ Respond with access token
  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: { accessToken }
  });
});



export const refreshAdminToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing"
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  if (decoded.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden"
    });
  }

  const adminExists = await Admin.findById(decoded.adminId);
  if (!adminExists) {
    return res.status(403).json({
      success: false,
      message: "Forbidden"
    });
  }

  const accessToken = jwt.sign(
    { adminId: decoded.adminId, role: "admin" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  res.status(200).json({
    success: true,
    message: "Access token refreshed",
    data: { accessToken }
  });
});

export const adminLogout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});


export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(200).json({
      success: true,
      message: "If the email exists, an OTP has been sent"
    });
  }

  const otp = crypto.randomInt(1000, 10000).toString();

  admin.resetOtpHash = await bcrypt.hash(otp, 10);
  admin.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
  await admin.save();

  await sendOtpEmail({
    to: admin.email,
    otp
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to registered email"
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const admin = await Admin.findOne({
    email,
    resetOtpExpiry: { $gt: Date.now() }
  });

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP"
    });
  }

  const isOtpValid = await bcrypt.compare(otp, admin.resetOtpHash);
  if (!isOtpValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP"
    });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  admin.resetOtpHash = undefined;
  admin.resetOtpExpiry = undefined;
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful"
  });
});

/**
 * ======================
 * USER MANAGEMENT
 * ======================
 */

export const createUser = asyncHandler(async (req, res) => {
  const {
    role,
    companyName,
    email,
    country,
    state,
    street,
    city,
    zipcode,
    trn,
    creditLimit,
    password
  } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    role,
    companyName,
    email,
    country,
    state,
    street,
    city,
    zipcode,
    trn,
    creditLimit,
    passwordHash
  });

  res.status(201).json({
    success: true,
    message: "User created successfully"
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: false })
    .select("-passwordHash")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: users
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false
  }).select("-passwordHash");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).select("-passwordHash");

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updated
  });
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.isDeleted) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json({
    success: true,
    message: user.isBlocked ? "User blocked" : "User unblocked"
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  user.isDeleted = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User deleted successfully"
  });
});
