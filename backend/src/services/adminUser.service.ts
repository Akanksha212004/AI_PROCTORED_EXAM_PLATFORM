// src/services/adminUser.service.ts

import type { Role } from "@prisma/client";
import type { ZodError } from "zod";

import { ApiError } from "../utils/apiError";
import { toUserRead } from "../utils/serializeUser";
import * as adminUserRepository from "../repositories/adminUser.repository";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../schemas/admin.schema";

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return new ApiError(422, message);
}

export async function listUsers(rawQuery: unknown) {
  const parsed = listUsersQuerySchema.safeParse(rawQuery);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);
  const { search, role, status, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const filters = { search, role, isActive: status ? status === "active" : undefined };

  const [total, users] = await Promise.all([
    adminUserRepository.countUsers(filters),
    adminUserRepository.findUsers(filters, skip, limit),
  ]);

  const studentIds = users.filter((u) => u.role === "STUDENT").map((u) => u.id);
  const staffIds = users.filter((u) => u.role === "EXAMINER" || u.role === "ADMIN").map((u) => u.id);

  const [sessionCounts, examCounts] = await Promise.all([
    adminUserRepository.countSessionsByStudentIds(studentIds),
    adminUserRepository.countExamsCreatedByIds(staffIds),
  ]);

  const items = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    // Exams taken (students) or exams created (examiners/admins) — whichever applies to this role.
    activityCount: user.role === "STUDENT" ? sessionCounts.get(user.id) ?? 0 : examCounts.get(user.id) ?? 0,
  }));

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getUser(userId: string) {
  const user = await adminUserRepository.findUserById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return toUserRead(user);
}

export async function createUser(rawInput: unknown) {
  const parsed = createUserSchema.safeParse(rawInput);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const existing = await adminUserRepository.findByEmail(parsed.data.email);
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await adminUserRepository.createUser(parsed.data);
  return toUserRead(user);
}

/** Activates/deactivates any platform account. Admins cannot deactivate their own account
 *  (would risk locking every admin out), but can act on any other user regardless of role. */
export async function setUserStatus(actingAdminId: string, userId: string, rawInput: unknown) {
  const parsed = updateUserStatusSchema.safeParse(rawInput);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  if (userId === actingAdminId) {
    throw ApiError.badRequest("You cannot change the active status of your own account");
  }

  const user = await adminUserRepository.findUserById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const updated = await adminUserRepository.updateUserStatus(userId, parsed.data.isActive);
  return toUserRead(updated);
}

/** Changes any user's role. Admins cannot change their own role (would risk locking
 *  themselves out of the admin dashboard mid-session). */
export async function setUserRole(actingAdminId: string, userId: string, rawInput: unknown) {
  const parsed = updateUserRoleSchema.safeParse(rawInput);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  if (userId === actingAdminId) {
    throw ApiError.badRequest("You cannot change your own role");
  }

  const user = await adminUserRepository.findUserById(userId);
  if (!user) throw ApiError.notFound("User not found");

  const updated = await adminUserRepository.updateUserRole(userId, parsed.data.role as Role);
  return toUserRead(updated);
}
