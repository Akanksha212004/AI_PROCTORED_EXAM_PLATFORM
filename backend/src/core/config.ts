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

  /// Optional. MyMemory (the free machine-translation API used for
  /// dynamic/database content — see src/services/content.service.ts)
  /// gives every anonymous caller ~5,000 chars/day. Passing a contact
  /// email via the `de` query param raises that to ~50,000 chars/day,
  /// for free, no signup. Since we call it from the server (a single
  /// shared IP, not one quota per browser), setting this is strongly
  /// recommended — leave unset and it still works, just with a much
  /// smaller shared quota. See https://mymemory.translated.net/doc/usagelimits.php
  MYMEMORY_EMAIL: process.env.MYMEMORY_EMAIL || undefined,
} as const;
