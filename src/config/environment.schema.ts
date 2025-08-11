import * as Joi from "joi";

export const environmentSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  // Server
  PORT: Joi.number().default(3000),

  // Database
  DATABASE_URL: Joi.string().required(),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required().messages({
    "string.min": "JWT_SECRET must be at least 32 characters long for security",
    "any.required": "JWT_SECRET is required",
  }),
  JWT_EXPIRES_IN: Joi.string().default("15m"),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().messages({
    "string.min":
      "JWT_REFRESH_SECRET must be at least 32 characters long for security",
    "any.required": "JWT_REFRESH_SECRET is required",
  }),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),

  // AWS S3 Configuration
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_S3_BUCKET_NAME: Joi.string().required(),

  // S3 Module Paths
  S3_PRODUCTS_PATH: Joi.string().default("products"),
  S3_USERS_PATH: Joi.string().default("users"),
  S3_MATERIALS_PATH: Joi.string().default("materials"),

  // Upload Configuration
  MAX_IMAGES_PER_PRODUCT: Joi.number().min(1).max(10).default(3).messages({
    "number.min": "MAX_IMAGES_PER_PRODUCT must be at least 1",
    "number.max": "MAX_IMAGES_PER_PRODUCT cannot exceed 10",
  }),
  ALLOWED_FILE_TYPES: Joi.string()
    .pattern(/^[a-z0-9]+(,[a-z0-9]+)*$/)
    .default("jpg,jpeg,png,webp")
    .messages({
      "string.pattern.base":
        "ALLOWED_FILE_TYPES must be comma-separated lowercase extensions (e.g., jpg,png,webp)",
    }),
  MAX_FILE_SIZE_MB: Joi.number().min(1).max(50).default(5).messages({
    "number.min": "MAX_FILE_SIZE_MB must be at least 1MB",
    "number.max": "MAX_FILE_SIZE_MB cannot exceed 50MB",
  }),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "debug")
    .default("info"),

  // Development specific (optional)
  CORS_ORIGIN: Joi.string().optional(),
});
