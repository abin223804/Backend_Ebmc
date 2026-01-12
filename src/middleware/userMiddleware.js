import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * =========================
 * VERIFY USER MIDDLEWARE
 * =========================
 */
export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify access token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 3️⃣ Fetch user
    const user = await User.findById(decoded.userId).select(
      "_id role isBlocked isDeleted"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    // 4️⃣ Check account status
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account is blocked"
      });
    }

    // 5️⃣ Attach user to request
    req.user = {
      userId: user._id,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
};
