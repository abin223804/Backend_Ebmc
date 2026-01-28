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
    console.log('🔄 Starting server...');
    console.log('📍 PORT:', PORT);
    console.log('📍 NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');

    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    console.log('🔄 Starting HTTP server...');
    // Bind to 0.0.0.0 to accept connections from deployment platforms
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Ready to accept connections`);
    });

    // Graceful shutdown on SIGTERM (deployment platforms use this)
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    console.error("Stack trace:", err.stack);
    process.exit(1);
  }
};

startServer();
