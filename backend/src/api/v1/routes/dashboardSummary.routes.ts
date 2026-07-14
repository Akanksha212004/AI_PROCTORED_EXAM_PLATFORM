// src/api/v1/routes/dashboardSummary.routes.ts
//
// Mount in src/api/v1/index.ts:
//   import dashboardSummaryRoutes from "./routes/dashboardSummary.routes";
//   router.use("/examiner", dashboardSummaryRoutes);
//
// Resulting endpoint: GET /api/v1/examiner/dashboard-summary

import { Router } from "express";

import { getDashboardSummary } from "../controllers/dashboardSummary.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/dashboard-summary", authenticate, requireRoles("EXAMINER", "ADMIN"), getDashboardSummary);

export default router;
