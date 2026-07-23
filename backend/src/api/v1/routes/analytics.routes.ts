// src/api/v1/routes/analytics.routes.ts
//
// Mount in src/api/v1/index.ts, same prefix as the other examiner routes:
//   import analyticsRoutes from "./routes/analytics.routes";
//   router.use("/examiner", analyticsRoutes);
//
// Resulting endpoint: GET /api/v1/examiner/analytics?weeks=8&examLimit=10

import { Router } from "express";

import { getAnalytics } from "../controllers/analytics.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/analytics", authenticate, requireRoles("EXAMINER", "ADMIN"), getAnalytics);

export default router;
