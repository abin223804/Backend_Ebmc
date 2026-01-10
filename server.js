import "dotenv/config";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

/**
 * ======================
 * PROCESS-LEVEL SAFETY
 * ======================
 */

// Catches synchronous exceptions
process.on("uncaughtException", err => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

// Catches rejected promises not handled anywhere else
process.on("unhandledRejection", err => {
  console.error("💥 UNHANDLED PROMISE REJECTION:", err);
  process.exit(1);
});

/**
 * ======================
 * START SERVER
 * ======================
 */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();
