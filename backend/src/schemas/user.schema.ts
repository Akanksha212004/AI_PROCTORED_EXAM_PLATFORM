// /**
//  * Zod schemas — the Node equivalent of `app/schemas/user.py`.
//  * Zod gives runtime validation AND a static TypeScript type from the
//  * same definition (`z.infer`), mirroring how Pydantic models double
//  * as both validators and type hints.
//  */
// import { z } from "zod";

// export const RoleEnum = z.enum(["STUDENT", "EXAMINER", "ADMIN"]);
// export type RoleEnum = z.infer<typeof RoleEnum>;

// const passwordSchema = z
//   .string()
//   .min(8, "Password must be at least 8 characters long")
//   .max(128)
//   .refine((v) => /[A-Z]/.test(v), "Password must contain at least one uppercase letter")
//   .refine((v) => /[a-z]/.test(v), "Password must contain at least one lowercase letter")
//   .refine((v) => /\d/.test(v), "Password must contain at least one digit")
//   .refine(
//     (v) => /[!@#$%^&*()\-_=+[\]{};:'",.<>/?`~|\\]/.test(v),
//     "Password must contain at least one special character"
//   );

// export const registerSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters").max(150),
//   email: z.string().email("Enter a valid email address").toLowerCase(),
//   password: passwordSchema,
//   role: RoleEnum.default("STUDENT"),
// });
// export type RegisterInput = z.infer<typeof registerSchema>;

// export const userReadSchema = z.object({
//   id: z.string().min(1),
//   name: z.string(),
//   email: z.string().email(),
//   role: RoleEnum,
//   isActive: z.boolean(),
//   createdAt: z.date(),
//   updatedAt: z.date(),
// });
// export type UserRead = z.infer<typeof userReadSchema>;

// export const updateProfileSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters").max(150),
// });
// export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// export const changePasswordSchema = z.object({
//   currentPassword: z.string().min(1, "Current password is required"),
//   newPassword: passwordSchema,
// });
// export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;






// /**
//  * Zod schemas — the Node equivalent of `app/schemas/user.py`.
//  * Zod gives runtime validation AND a static TypeScript type from the
//  * same definition (`z.infer`), mirroring how Pydantic models double
//  * as both validators and type hints.
//  */
// import { z } from "zod";

// export const RoleEnum = z.enum(["STUDENT", "EXAMINER", "ADMIN"]);
// export type RoleEnum = z.infer<typeof RoleEnum>;

// export const passwordSchema = z
//   .string()
//   .min(8, "Password must be at least 8 characters long")
//   .max(128)
//   .refine((v) => /[A-Z]/.test(v), "Password must contain at least one uppercase letter")
//   .refine((v) => /[a-z]/.test(v), "Password must contain at least one lowercase letter")
//   .refine((v) => /\d/.test(v), "Password must contain at least one digit")
//   .refine(
//     (v) => /[!@#$%^&*()\-_=+[\]{};:'",.<>/?`~|\\]/.test(v),
//     "Password must contain at least one special character"
//   );

// /**
//  * Public self-registration is STUDENT-only. Examiners no longer get a
//  * `role` field to self-elevate with — they go through
//  * `requestExaminerAccessSchema` (see examinerAccess.schema.ts) instead,
//  * which creates a PENDING account that can't log in until an admin
//  * approves it. authService.register additionally hardcodes role:
//  * "STUDENT" server-side regardless of what a raw API call sends, so
//  * this isn't just a frontend-enforced rule.
//  */
// export const registerSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters").max(150),
//   email: z.string().email("Enter a valid email address").toLowerCase(),
//   password: passwordSchema,
// });
// export type RegisterInput = z.infer<typeof registerSchema>;

// export const userReadSchema = z.object({
//   id: z.string().min(1),
//   name: z.string(),
//   email: z.string().email(),
//   role: RoleEnum,
//   isActive: z.boolean(),
//   createdAt: z.date(),
//   updatedAt: z.date(),
// });
// export type UserRead = z.infer<typeof userReadSchema>;





import { z } from "zod";

// 1. Role Enum (Required by admin.schema.ts & user schemas)
export const RoleEnum = z.enum(["STUDENT", "EXAMINER", "ADMIN"]);
export type Role = z.infer<typeof RoleEnum>;

// 2. Password Schema (Must be a simple string validator)
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

// 3. Register Schema & Type (Required by auth.routes.ts & auth.service.ts)
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  role: RoleEnum.optional().default("STUDENT"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// 4. Login Schema & Type
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// 5. Update Profile Schema & Type
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  avatarUrl: z.string().url().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// 6. Change Password Schema & Type
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// 7. Base User Schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleEnum,
  isActive: z.boolean(),
});