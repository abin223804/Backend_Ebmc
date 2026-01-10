import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Admin from "../models/adminModel.js";


const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
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
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { accessToken },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const refreshAdminToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const adminExists = await Admin.findById(decoded.adminId);
    if (!adminExists) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const newAccessToken = jwt.sign(
      { adminId: decoded.adminId, role: "admin" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    console.error("refreshAdminToken error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const adminLogout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("adminLogout error:", err);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    // Prevent email enumeration
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
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>Expires in 5 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to registered email",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const admin = await Admin.findOne({
      email,
      resetOtpExpiry: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, admin.resetOtpHash);
    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    admin.resetOtpHash = undefined;
    admin.resetOtpExpiry = undefined;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  adminLogin,
  refreshAdminToken,
  adminLogout,
  forgotPassword,
  resetPassword,
};
