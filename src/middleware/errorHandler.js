

import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {

  // Allow preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  logger.error(err.message, {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  // Set status code correctly
  let statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : 500;

  let message = err.message || "Internal server error";

  // ✅ Mongo duplicate key
  if (err.code === 11000) {
    statusCode = 409;

    const field = err.keyValue
      ? Object.keys(err.keyValue)[0]
      : "Field";

    message = `${field} already exists`;
  }

  // ✅ Zod validation
  if (err.name === "ZodError") {
    statusCode = 400;
    message = err.errors[0].message;
  }

  // ✅ JWT error
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  // ✅ CORS
  if (err.message === "Not allowed by CORS") {
    statusCode = 403;
    message = "CORS blocked this request";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
};

export default errorHandler;
