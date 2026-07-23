/**
 * User (profile / account settings) service.
 * Powers the Settings page: updating display name and changing password.
 */
import { userRepository } from "../repositories/user.repository";
import { hashPassword, verifyPassword } from "../core/security";
import { ApiError } from "../utils/apiError";
import { toUserRead } from "../utils/serializeUser";
import type { ChangePasswordInput, UpdateProfileInput } from "../schemas/user.schema";

export const userService = {
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const updated = await userRepository.updateName(userId, input.name);
    return toUserRead(updated);
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    const isCurrentValid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!isCurrentValid) throw ApiError.badRequest("Current password is incorrect");

    const passwordHash = await hashPassword(input.newPassword);
    await userRepository.updatePasswordHash(userId, passwordHash);

    return { message: "Password updated successfully" };
  },
};