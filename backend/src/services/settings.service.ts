// src/services/settings.service.ts

import type { ZodError } from "zod";

import { hashPassword, verifyPassword } from "../core/security";
import { userRepository } from "../repositories/user.repository";
import { changePasswordSchema, updateProfileSchema } from "../schemas/settings.schema";
import { ApiError } from "../utils/apiError";
import { toUserRead } from "../utils/serializeUser";

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return new ApiError(422, message);
}

export async function updateProfile(userId: string, rawPayload: unknown) {
  const parsed = updateProfileSchema.safeParse(rawPayload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const updated = await userRepository.updateProfile(userId, { name: parsed.data.name });
  return toUserRead(updated);
}

export async function changePassword(userId: string, rawPayload: unknown) {
  const parsed = changePasswordSchema.safeParse(rawPayload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const user = await userRepository.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const isCurrentPasswordValid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) throw ApiError.unauthorized("Current password is incorrect");

  const newPasswordHash = await hashPassword(parsed.data.newPassword);
  await userRepository.updatePassword(userId, newPasswordHash);

  return { message: "Password updated successfully" };
}
