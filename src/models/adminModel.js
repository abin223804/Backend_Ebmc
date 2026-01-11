import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  refreshTokenHash: String,
  expiresAt: Date,

  ipAddress: String,
  userAgent: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },

  resetOtpHash: String,
  resetOtpExpiry: Date,

  // 🔐 SESSION TRACKING
  sessions: [sessionSchema],
});

export default mongoose.model("Admin", adminSchema);
