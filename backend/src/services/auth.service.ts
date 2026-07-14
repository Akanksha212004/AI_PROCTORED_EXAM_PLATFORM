/**
 * Auth service — the Node equivalent of `app/services/auth_service.py`.
 * Business logic lives here; controllers stay thin.
 */
import { userRepository } from "../repositories/user.repository";
import { signAccessToken, verifyPassword } from "../core/security";
import { ApiError } from "../utils/apiError";
import { toUserRead } from "../utils/serializeUser";
import type { RegisterInput } from "../schemas/user.schema";
import type { LoginInput } from "../schemas/auth.schema";

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }
    const user = await userRepository.create(input);
    return toUserRead(user);
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    if (!user.isActive) {
      throw ApiError.forbidden("This account has been deactivated");
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });

    return {
      access_token: accessToken,
      token_type: "bearer",
      role: user.role,
      user: toUserRead(user),
    };
  },
};
