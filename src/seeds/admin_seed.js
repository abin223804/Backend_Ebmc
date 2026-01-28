import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Admin from "../models/adminModel.js";

dotenv.config();

// const ADMIN_EMAIL = "abinschandran1@gmail.com";
const ADMIN_EMAIL = "visakhr3093@gmail.com";
// const ADMIN_PASSWORD = "myPassword1234";
const ADMIN_PASSWORD = "User@1234";


const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // 🔥 Delete existing admin with same email
    const deleted = await Admin.deleteOne({ email: ADMIN_EMAIL });

    if (deleted.deletedCount > 0) {
      console.log("🗑️ Existing admin deleted");
    } else {
      console.log("ℹ️ No existing admin found");
    }

    // 🔐 Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // ➕ Create new admin
    await Admin.create({
      email: ADMIN_EMAIL,
      passwordHash,
    });

    console.log("🎉 New admin created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Admin seeding failed:", error);
    process.exit(1);
  }
};

seedAdmin();
