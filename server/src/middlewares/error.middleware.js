import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

const cleanupTempFiles = (req) => {
  if (!req) return;
  const paths = [];
  if (req.file?.path) paths.push(req.file.path);
  if (Array.isArray(req.files)) {
    for (const f of req.files) {
      if (f?.path) paths.push(f.path);
    }
  }
  for (const filePath of paths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // ignore
    }
  }
};

export const errorHandler = (err, req, res, _next) => {
  cleanupTempFiles(req);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: Array.isArray(err.errors) && err.errors.length > 0 ? err.errors : [err.message],
    });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    const message = messages.join("; ") || "Validation failed";
    return res.status(400).json({
      success: false,
      message,
      errors: messages.length > 0 ? messages : [message],
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    const message = `${field} already exists`;
    return res.status(409).json({
      success: false,
      message,
      errors: [message],
    });
  }

  if (err.name === "CastError") {
    const message = `Invalid ${err.path || "identifier"}`;
    return res.status(400).json({
      success: false,
      message,
      errors: [message],
    });
  }

  if (err.type === "entity.parse.failed" || (err instanceof SyntaxError && err.status === 400 && "body" in err)) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
      errors: ["Invalid JSON body"],
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
      errors: [err.message || "File upload error"],
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      errors: ["Invalid token"],
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      errors: ["Token expired"],
    });
  }

  if (err.statusCode && typeof err.statusCode === "number") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
      errors: Array.isArray(err.errors) && err.errors.length > 0 ? err.errors : [err.message || "Error"],
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: ["Internal server error"],
  });
};
