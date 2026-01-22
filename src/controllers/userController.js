// // import jwt from "jsonwebtoken";
// // import bcrypt from "bcrypt";
// // import User from "../models/userModel.js";
// // import asyncHandler from "../utils/asyncHandler.js";
// // import { sendUserLoginAlertEmail } from "../utils/sendEmail.js";

// // export const userLogin = asyncHandler(async (req, res) => {
// //   const { email, password } = req.body;

// //   const user = await User.findOne({ email });
// //   if (!user || user.isDeleted || user.isBlocked) {
// //     return res.status(401).json({
// //       success: false,
// //       message: "Invalid credentials"
// //     });
// //   }

// //   const isValid = await bcrypt.compare(password, user.passwordHash);
// //   if (!isValid) {
// //     return res.status(401).json({
// //       success: false,
// //       message: "Invalid credentials"
// //     });
// //   }


// //   // Tokens
// //   const accessToken = jwt.sign(
// //     { userId: user._id, role: user.role },
// //     process.env.JWT_ACCESS_SECRET,
// //     { expiresIn: "15m" }
// //   );

// //   const refreshToken = jwt.sign(
// //     { userId: user._id },
// //     process.env.JWT_REFRESH_SECRET,
// //     { expiresIn: "7d" }
// //   );

// //   // 📧 Login alert email
// //   await sendUserLoginAlertEmail({
// //     to: user.email,
// //     ipAddress: req.ip,
// //     userAgent: req.headers["user-agent"]
// //   });

// //   res.cookie("userRefreshToken", refreshToken, {
// //     httpOnly: true,
// //     secure: true, // Required for sameSite: "none"
// //     sameSite: "none",
// //     maxAge: 7 * 24 * 60 * 60 * 1000,
// //     path: "/"
// //   });

// //   res.status(200).json({
// //     success: true,
// //     message: "Login successful",
// //     data: { accessToken }
// //   });
// // });


// // export const refreshUserToken = asyncHandler(async (req, res) => {
// //   const token = req.cookies?.userRefreshToken;
// //   if (!token) {
// //     return res.status(401).json({
// //       success: false,
// //       message: "Refresh token missing"
// //     });
// //   }

// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
// //     const user = await User.findById(decoded.userId);

// //     if (!user) {
// //       return res.status(403).json({
// //         success: false,
// //         message: "User not found"
// //       });
// //     }

// //     // Issue new access token
// //     const newAccessToken = jwt.sign(
// //       { userId: user._id, role: user.role },
// //       process.env.JWT_ACCESS_SECRET,
// //       { expiresIn: "15m" }
// //     );

// //     // Re-set the refresh token cookie to ensure it persists
// //     res.cookie("userRefreshToken", token, {
// //       httpOnly: true,
// //       secure: process.env.NODE_ENV === "production",
// //       sameSite: "none",
// //       maxAge: 7 * 24 * 60 * 60 * 1000,
// //       path: "/"
// //     });

// //     res.status(200).json({
// //       success: true,
// //       data: { accessToken: newAccessToken }
// //     });
// //   } catch (error) {
// //     return res.status(403).json({
// //       success: false,
// //       message: "Invalid refresh token",
// //     });
// //   }
// // });

// // export const logoutUser = asyncHandler(async (req, res) => {
// //   res.clearCookie("userRefreshToken", {
// //     httpOnly: true,
// //     secure: process.env.NODE_ENV === "production",
// //     sameSite: "lax",
// //     path: "/"
// //   });

// //   res.status(200).json({
// //     success: true,
// //     message: "Logged out successfully"
// //   });
// // });




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
  secure: isProduction,                 // HTTPS only in prod
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,       // 7 days
  path: "/"
};

/* ======================================================
   Token Helpers
====================================================== */
const signAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET_USER,
    { expiresIn: "15m" }
  );

const signRefreshToken = (userId) =>
  jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET_USER,
    { expiresIn: "7d" }
  );

/* ======================================================
   LOGIN
====================================================== */
export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  const user = await User.findOne({ email });
  if (!user || user.isDeleted || user.isBlocked) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user._id);

  // Login alert email (non-blocking)
  sendUserLoginAlertEmail({
    to: user.email,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
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
        role: user.role
      }
    }
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
      message: "Refresh token missing"
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_USER);
  } catch {
    res.clearCookie("userRefreshToken", refreshTokenCookieOptions);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token"
    });
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.isDeleted || user.isBlocked) {
    res.clearCookie("userRefreshToken", refreshTokenCookieOptions);
    return res.status(403).json({
      success: false,
      message: "User no longer valid"
    });
  }

  const newAccessToken = signAccessToken(user);

  // Re-set SAME cookie (prevents browser deletion)
  res.cookie("userRefreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    data: { accessToken: newAccessToken }
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
    path: "/"
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});




// export const logoutUser = asyncHandler(async (req, res) => {
//   res.clearCookie("userRefreshToken", refreshTokenCookieOptions);

//   res.status(200).json({
//     success: true,
//     message: "Logged out successfully"
//   });
// });


// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import User from "../models/userModel.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import hashToken from "../utils/hashToken.js";

// import { sendUserLoginAlertEmail } from "../utils/sendEmail.js";

// export const userLogin = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
//   if (!user || user.isDeleted || user.isBlocked) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid credentials"
//     });
//   }

//   const isValid = await bcrypt.compare(password, user.passwordHash);
//   if (!isValid) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid credentials"
//     });
//   }

//   // Tokens
//   const accessToken = jwt.sign(
//     { userId: user._id, role: user.role },
//     process.env.JWT_ACCESS_SECRET,
//     { expiresIn: "30m" }
//   );

//   const refreshToken = jwt.sign(
//     { userId: user._id },
//     process.env.JWT_REFRESH_SECRET,
//     { expiresIn: "7d" }
//   );

//   // Create session
//   user.sessions.push({
//     refreshTokenHash: hashToken(refreshToken),
//     expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
//     ipAddress: req.ip,
//     userAgent: req.headers["user-agent"]
//   });

//   await user.save();

//   // 📧 Login alert email
//   await sendUserLoginAlertEmail({
//     to: user.email,
//     ipAddress: req.ip,
//     userAgent: req.headers["user-agent"]
//   });

//   res.cookie("userRefreshToken", refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     path: "/"
//   });

//   res.status(200).json({
//     success: true,
//     message: "Login successful",
//     data: { accessToken }
//   });
// });


// export const refreshUserToken = asyncHandler(async (req, res) => {
//   const token = req.cookies?.userRefreshToken;
//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Refresh token missing"
//     });
//   }

//   const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
//   const user = await User.findById(decoded.userId);

//   if (!user) {
//     return res.status(403).json({
//       success: false,
//       message: "Session expired"
//     });
//   }

//   const tokenHash = hashToken(token);

//   const session = user.sessions.find(
//     s => s.refreshTokenHash === tokenHash
//   );

//   if (!session) {
//     // 🚨 TOKEN REUSE / STOLEN TOKEN
//     user.sessions = [];
//     await user.save();

//     await sendUserLoginAlertEmail({
//       to: user.email,
//       ipAddress: req.ip,
//       userAgent: req.headers["user-agent"]
//     });

//     return res.status(403).json({
//       success: false,
//       message: "Suspicious activity detected. Please login again."
//     });
//   }

//   // 🚨 IP or Device change detection
//   if (
//     session.ipAddress !== req.ip ||
//     session.userAgent !== req.headers["user-agent"]
//   ) {
//     // Invalidate only this session
//     user.sessions = user.sessions.filter(
//       s => s.refreshTokenHash !== tokenHash
//     );
//     await user.save();

//     return res.status(403).json({
//       success: false,
//       message: "Session anomaly detected. Please login again."
//     });
//   }

//   // Issue new access token
//   const newAccessToken = jwt.sign(
//     { userId: user._id, role: user.role },
//     process.env.JWT_ACCESS_SECRET,
//     { expiresIn: "30m" }
//   );

//   res.status(200).json({
//     success: true,
//     data: { accessToken: newAccessToken }
//   });
// });



// export const getUserSessions = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.userId);

//   const currentHash = hashToken(req.cookies.userRefreshToken);

//   const sessions = user.sessions.map(s => ({
//     id: s._id,
//     ipAddress: s.ipAddress,
//     userAgent: s.userAgent,
//     createdAt: s.createdAt,
//     isCurrent: s.refreshTokenHash === currentHash
//   }));

//   res.status(200).json({
//     success: true,
//     data: sessions
//   });
// });

// export const logoutUserSession = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.userId);

//   user.sessions = user.sessions.filter(
//     s => s._id.toString() !== req.params.sessionId
//   );

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: "Session logged out"
//   });
// });

// export const logoutAllUserSessions = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.userId);

//   user.sessions = [];
//   await user.save();

//   res.clearCookie("userRefreshToken", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     path: "/"
//   });

//   res.status(200).json({
//     success: true,
//     message: "Logged out from all devices"
//   });
// });