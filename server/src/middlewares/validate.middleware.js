import { ApiError } from "../utils/ApiError.js";

export const validateBody = (rules) => (req, _res, next) => {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = req.body[field];

    if (rule.required && (value === undefined || value === null || String(value).trim() === "")) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (rule.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      errors.push(`${field} must be a valid email`);
    }

    if (rule.minLength && String(value).length < rule.minLength) {
      errors.push(`${field} must be at least ${rule.minLength} characters`);
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rule.enum.join(", ")}`);
    }
  }

  if (errors.length) {
    throw new ApiError(400, errors.join("; "));
  }

  next();
};
