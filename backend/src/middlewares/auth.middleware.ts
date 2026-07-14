/**
 * Equivalent of `app/api/deps.py`: `authenticate` mirrors
 * `get_current_user`, and `requireRoles(...)` mirrors the
 * `require_roles(...)` dependency factory.
 */
import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";

import { verifyAccessToken } from "../core/security";
import { userRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) throw ApiError.unauthorized();

  const payload = verifyAccessToken(token);
  if (!payload) throw ApiError.unauthorized();

  const user = await userRepository.findById(payload.sub);
  if (!user) throw ApiError.unauthorized();
  if (!user.isActive) throw ApiError.forbidden("Account is deactivated");

  req.user = user;
  next();
});

/**
 * Usage: router.post("/questions", authenticate, requireRoles("EXAMINER", "ADMIN"), handler)
 */
export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden();
    }
    next();
  };
}
