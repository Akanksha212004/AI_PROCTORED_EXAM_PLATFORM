/**
 * Security primitives — the Node equivalent of `app/core/security.py`.
 * Kept isolated from business logic so future modules (exam session
 * tokens, signed proctoring URLs) can reuse `signAccessToken` / `verifyAccessToken`.
 */
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";

import { env } from "./config";

const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

export interface JwtPayload {
  sub: string; // user id
  role: Role;
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
