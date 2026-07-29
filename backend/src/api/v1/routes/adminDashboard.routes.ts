// src/api/v1/routes/adminDashboard.routes.ts
//
// Mount in src/api/v1/index.ts:
//   import adminDashboardRoutes from "./routes/adminDashboard.routes";
//   router.use("/admin", adminDashboardRoutes);
//
// Resulting endpoint (ADMIN only): GET /api/v1/admin/dashboard-summary

import { Router } from "express";

import { getAdminDashboardSummary } from "../controllers/adminDashboard.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/dashboard-summary", authenticate, requireRoles("ADMIN"), getAdminDashboardSummary);

export default router;
