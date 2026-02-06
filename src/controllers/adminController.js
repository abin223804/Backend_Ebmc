import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import hashToken from "../utils/hashToken.js";
import { sendOtpEmail, sendLoginAlertEmail } from "../utils/sendEmail.js";

/* ======================================================
   COOKIE CONFIG (SINGLE SOURCE OF TRUTH)
====================================================== */
const isProduction = process.env.NODE_ENV === "production";


const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

/* ======================================================
   TOKEN HELPERS
====================================================== */
const signAdminAccessToken = (adminId) =>
  jwt.sign({ adminId, role: "admin" }, process.env.JWT_ACCESS_SECRET_ADMIN, {
    expiresIn: "15m",
  });

const signAdminRefreshToken = (adminId) =>
  jwt.sign({ adminId, role: "admin" }, process.env.JWT_REFRESH_SECRET_ADMIN, {
    expiresIn: "7d",
  });

/* ======================================================
   ADMIN LOGIN
====================================================== */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const accessToken = signAdminAccessToken(admin._id);
  const refreshToken = signAdminRefreshToken(admin._id);

  admin.sessions.push({
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  await admin.save();

  // non-blocking
  sendLoginAlertEmail({
    to: admin.email,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  }).catch(console.error);

  res.cookie("adminRefreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { accessToken },
  });
});

/* ======================================================
   REFRESH ADMIN TOKEN
====================================================== */
export const refreshAdminToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.adminRefreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Refresh token missing" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_ADMIN);
  } catch {
    res.clearCookie("adminRefreshToken", refreshTokenCookieOptions);
    return res
      .status(403)
      .json({ success: false, message: "Invalid refresh token" });
  }

  if (decoded.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const admin = await Admin.findById(decoded.adminId);
  if (!admin) {
    res.clearCookie("adminRefreshToken", refreshTokenCookieOptions);
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const tokenHash = hashToken(refreshToken);
  const session = admin.sessions.find(
    (s) => s.refreshTokenHash === tokenHash && s.expiresAt > Date.now(),
  );

  if (!session) {
    res.clearCookie("adminRefreshToken", refreshTokenCookieOptions);
    return res.status(403).json({ success: false, message: "Session expired" });
  }

  const newAccessToken = signAdminAccessToken(admin._id);

  // Re-set SAME cookie (prevents deletion)
  res.cookie("adminRefreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    data: { accessToken: newAccessToken },
  });
});

export const adminLogout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.adminRefreshToken;

  if (refreshToken) {
    try {
      // ✅ VERIFY instead of decode
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_ADMIN,
      );

      if (decoded?.adminId) {
        await Admin.updateOne(
          { _id: decoded.adminId },
          {
            $pull: {
              sessions: {
                refreshTokenHash: hashToken(refreshToken),
              },
            },
          },
        );
      }
    } catch (err) {
      // Invalid/expired token → ignore (logout must still succeed)
      console.warn("Admin logout: invalid refresh token");
    }
  }

  // ✅ MUST match cookie options exactly
  res.clearCookie("adminRefreshToken", {
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

/* ======================================================
   ADMIN LOGOUT
====================================================== */
// export const adminLogout = asyncHandler(async (req, res) => {
//   const refreshToken = req.cookies?.adminRefreshToken;

//   if (refreshToken) {
//     const decoded = jwt.decode(refreshToken);
//     if (decoded?.adminId) {
//       await Admin.updateOne(
//         { _id: decoded.adminId },
//         { $pull: { sessions: { refreshTokenHash: hashToken(refreshToken) } } }
//       );
//     }
//   }

//   res.clearCookie("adminRefreshToken", refreshTokenCookieOptions);

//   res.status(200).json({
//     success: true,
//     message: "Logged out successfully"
//   });
// });

/* ======================================================
   FORGOT PASSWORD
====================================================== */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(200).json({
      success: true,
      message: "If the email exists, an OTP has been sent",
    });
  }

  const otp = crypto.randomInt(1000, 10000).toString();

  admin.resetOtpHash = await bcrypt.hash(otp, 10);
  admin.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
  await admin.save();

  await sendOtpEmail({ to: admin.email, otp });

  res.status(200).json({
    success: true,
    message: "OTP sent to registered email",
  });
});

/* ======================================================
   RESET PASSWORD
====================================================== */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const admin = await Admin.findOne({
    email,
    resetOtpExpiry: { $gt: Date.now() },
  });

  if (!admin || !(await bcrypt.compare(otp, admin.resetOtpHash))) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  admin.resetOtpHash = undefined;
  admin.resetOtpExpiry = undefined;
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

/* ======================================================
   USER MANAGEMENT (UNCHANGED, SAFE)
====================================================== */

export const createUser = asyncHandler(async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    await User.create({ ...req.body, passwordHash });

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Handle duplicate key errors (e.g., email already exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    // Re-throw other errors to be handled by asyncHandler
    throw error;
  }
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: false })
    .select("-passwordHash")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).select("-passwordHash");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).select("-passwordHash");

  if (!updated) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updated,
  });
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.isDeleted) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json({
    success: true,
    message: user.isBlocked ? "User blocked" : "User unblocked",
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.isDeleted = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
