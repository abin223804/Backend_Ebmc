import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import hashToken from "../utils/hashToken.js";

import { sendUserLoginAlertEmail } from "../utils/sendEmail.js";

export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.isDeleted || user.isBlocked) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  // Tokens
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Create session
  user.sessions.push({
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  await user.save();

  // 📧 Login alert email
  await sendUserLoginAlertEmail({
    to: user.email,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.cookie("userRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { accessToken }
  });
});


export const refreshUserToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.userRefreshToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing"
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(403).json({
      success: false,
      message: "Session expired"
    });
  }

  const session = user.sessions.find(
    s => s.refreshTokenHash === hashToken(token)
  );

  if (!session || session.expiresAt < Date.now()) {
    return res.status(403).json({
      success: false,
      message: "Invalid session"
    });
  }

  const newAccessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "30m" }
  );

  res.status(200).json({
    success: true,
    data: { accessToken: newAccessToken }
  });
});


export const getUserSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  const currentHash = hashToken(req.cookies.userRefreshToken);

  const sessions = user.sessions.map(s => ({
    id: s._id,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    createdAt: s.createdAt,
    isCurrent: s.refreshTokenHash === currentHash
  }));

  res.status(200).json({
    success: true,
    data: sessions
  });
});

export const logoutUserSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  user.sessions = user.sessions.filter(
    s => s._id.toString() !== req.params.sessionId
  );

  await user.save();

  res.status(200).json({
    success: true,
    message: "Session logged out"
  });
});

export const logoutAllUserSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  user.sessions = [];
  await user.save();

  res.clearCookie("userRefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });

  res.status(200).json({
    success: true,
    message: "Logged out from all devices"
  });
});
