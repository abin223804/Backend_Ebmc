import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {

  // ✅ Allow preflight to pass silently
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  logger.error(err.message, {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  // Mongo duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field.toUpperCase()} already exists`
    });
  }

  // Zod validation
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: err.errors[0].message
    });
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  // CORS errors → return clean response
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS blocked this request"
    });
  }

  // Default
  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

export default errorHandler;
