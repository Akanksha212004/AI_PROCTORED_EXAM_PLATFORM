// src/api/v1/routes/reports.routes.ts
//
// Mount in src/api/v1/index.ts, same prefix as other examiner routes:
//   import reportsRoutes from "./routes/reports.routes";
//   router.use("/examiner", reportsRoutes);
//
// Resulting endpoints:
//   GET /api/v1/examiner/reports/exams
//   GET /api/v1/examiner/reports/exams/:examId/export

import { Router } from "express";

import { exportExamReport, listExamReports } from "../controllers/reports.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, requireRoles("EXAMINER", "ADMIN"));

router.get("/reports/exams", listExamReports);
router.get("/reports/exams/:examId/export", exportExamReport);

export default router;
