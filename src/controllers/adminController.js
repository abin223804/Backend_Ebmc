import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";


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



//userManagement



/**
 * CREATE USER
 */
export const createUser = async (req, res) => {
  try {
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

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

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

    return res.status(201).json({
      success: true,
      message: "User created successfully"
    });
  } catch (err) {
    console.error("createUser error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * GET ALL USERS
 */
 const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * GET SINGLE USER
 */
 const getUserById = async (req, res) => {
  try {
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

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * UPDATE USER (NO PASSWORD)
 */
 const updateUser = async (req, res) => {
  try {
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

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updated
    });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * BLOCK / UNBLOCK USER
 */
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isBlocked ? "User blocked" : "User unblocked"
    });
  } catch (err) {
    console.error("toggleBlockUser error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * DELETE USER (SOFT DELETE)
 */
 const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isDeleted = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};






export {
  adminLogin,
  refreshAdminToken,
  adminLogout,
  forgotPassword,
  resetPassword,
  getUsers,
  getUserById,
  updateUser,
  toggleBlockUser,
  deleteUser
};
