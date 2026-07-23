// src/api/v1/routes/notification.routes.ts
//
// Mount in src/api/v1/index.ts, same prefix as dashboardSummaryRoutes:
//   import notificationRoutes from "./routes/notification.routes";
//   router.use("/examiner", notificationRoutes);
//
// Resulting endpoints:
//   GET  /api/v1/examiner/notifications
//   POST /api/v1/examiner/notifications/mark-read

import { Router } from "express";

import { getNotifications, markNotificationsRead } from "../controllers/notification.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
import { validateQuery } from "../../../middlewares/validateQuery.middleware";
import { listNotificationsQuerySchema } from "../../../schemas/notification.schema";

const router = Router();

router.use(authenticate, requireRoles("EXAMINER", "ADMIN"));

router.get("/notifications", validateQuery(listNotificationsQuerySchema), getNotifications);
router.post("/notifications/mark-read", markNotificationsRead);

export default router;
