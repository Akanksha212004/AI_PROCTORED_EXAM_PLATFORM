// src/api/v1/routes/settings.routes.ts
//
// Mount in src/api/v1/index.ts, same prefix as userRoutes:
//   import settingsRoutes from "./routes/settings.routes";
//   router.use("/users", settingsRoutes);
//
// Resulting endpoints (any authenticated user — student, examiner, or admin):
//   PATCH /api/v1/users/me/profile
//   POST  /api/v1/users/me/change-password

import { Router } from "express";

import { changePassword, updateProfile } from "../controllers/settings.controller";
import { authenticate } from "../../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.patch("/me/profile", updateProfile);
router.post("/me/change-password", changePassword);

export default router;
