import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
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
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // 📧 Login alert email
  await sendUserLoginAlertEmail({
    to: user.email,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.cookie("userRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User not found"
      });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    // Re-set the refresh token cookie to ensure it persists
    res.cookie("userRefreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken }
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("userRefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});
