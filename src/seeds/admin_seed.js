import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Admin from "../models/adminModel.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await Admin.findOne({
      email: "abinschandran1@gmail.com"
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists. Seed skipped.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("myPassword", 10);

    await Admin.create({
      email: "abinschandran1@gmail.com",
      passwordHash
    });

    console.log("🎉 Admin seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Admin seeding failed:", error);
    process.exit(1);
  }
};

seedAdmin();
