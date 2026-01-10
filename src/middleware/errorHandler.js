import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field.toUpperCase()} already exists`
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: err.errors[0].message
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

export default errorHandler;
