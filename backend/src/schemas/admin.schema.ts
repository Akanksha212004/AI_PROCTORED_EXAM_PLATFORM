// src/schemas/admin.schema.ts

import { z } from "zod";

import { passwordSchema, RoleEnum } from "./user.schema";

export const listUsersQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: RoleEnum.optional(),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  email: z.string().email("Enter a valid email address").toLowerCase(),
  password: passwordSchema,
  role: RoleEnum,
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export const updateUserRoleSchema = z.object({
  role: RoleEnum,
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
