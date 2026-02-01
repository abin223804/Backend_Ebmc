import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendUserLoginAlertEmail } from "../utils/sendEmail.js";

/* ======================================================
   Cookie Config (SINGLE SOURCE OF TRUTH)
====================================================== */
const isProduction = process.env.NODE_ENV === "production";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction, // HTTPS only in prod
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

/* ======================================================
   Token Helpers
====================================================== */
const signAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET_USER,
    { expiresIn: "15m" },
  );

const signRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET_USER, {
    expiresIn: "7d",
  });

/* ======================================================
   LOGIN
====================================================== */
export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email });
  if (!user || user.isDeleted || user.isBlocked) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user._id);

  // Login alert email (non-blocking)
  sendUserLoginAlertEmail({
    to: user.email,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  }).catch(console.error);

  res.cookie("userRefreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/* ======================================================
   REFRESH ACCESS TOKEN
====================================================== */
export const refreshUserToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.userRefreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_USER);
  } catch {
    res.clearCookie("userRefreshToken", refreshTokenCookieOptions);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.isDeleted || user.isBlocked) {
    res.clearCookie("userRefreshToken", refreshTokenCookieOptions);
    return res.status(403).json({
      success: false,
      message: "User no longer valid",
    });
  }

  const newAccessToken = signAccessToken(user);

  // Re-set SAME cookie (prevents browser deletion)
  res.cookie("userRefreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    data: { accessToken: newAccessToken },
  });
});

/* ======================================================
   LOGOUT
====================================================== */

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("userRefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
