/**
 * Centralized application configuration — the Node equivalent of
 * `app/core/config.py`. Every other module reads from `env` instead of
 * calling `process.env` directly, so there's one source of truth and
 * one place to validate required variables at startup.
 */
import dotenv from "dotenv";

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 5000),
  API_V1_PREFIX: process.env.API_V1_PREFIX ?? "/api/v1",

  DATABASE_URL: required("DATABASE_URL"),

  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1h",

  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  /// Required for dynamic/database content translation (question text,
  /// exam titles, subjects, feedback — see src/services/content.service.ts).
  /// Sarvam AI (https://dashboard.sarvam.ai) is used instead of MyMemory:
  /// it's a proper Indic-language NMT model rather than a crowd-sourced
  /// translation-memory lookup, which is what was causing garbled/
  /// mismatched output for Hindi/Tamil/Telugu/Malayalam. Get a key from
  /// the Sarvam dashboard and set it here.
  SARVAM_API_KEY: required("SARVAM_API_KEY"),
} as const;
