// src/api/v1/routes/adminUser.routes.ts
//
// Mount in src/api/v1/index.ts:
//   import adminUserRoutes from "./routes/adminUser.routes";
//   router.use("/admin", adminUserRoutes);
//
// Resulting endpoints (ADMIN only):
//   GET   /api/v1/admin/users?search=&role=&status=&page=&limit=
//   GET   /api/v1/admin/users/:userId
//   POST  /api/v1/admin/users
//   PATCH /api/v1/admin/users/:userId/status
//   PATCH /api/v1/admin/users/:userId/role

import { Router } from "express";

import {
  createUser,
  getUser,
  listUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/adminUser.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { createUserSchema, updateUserRoleSchema, updateUserStatusSchema } from "../../../schemas/admin.schema";

const router = Router();

router.use(authenticate, requireRoles("ADMIN"));

router.get("/users", listUsers);
router.get("/users/:userId", getUser);
router.post("/users", validateBody(createUserSchema), createUser);
router.patch("/users/:userId/status", validateBody(updateUserStatusSchema), updateUserStatus);
router.patch("/users/:userId/role", validateBody(updateUserRoleSchema), updateUserRole);

export default router;
