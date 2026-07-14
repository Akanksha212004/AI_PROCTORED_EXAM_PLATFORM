import type { User } from "@prisma/client";

/**
 * Strips `passwordHash` before a user object ever reaches a response —
 * equivalent of Pydantic's `UserRead` schema only exposing safe fields.
 */
export function toUserRead(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export type SafeUser = ReturnType<typeof toUserRead>;
