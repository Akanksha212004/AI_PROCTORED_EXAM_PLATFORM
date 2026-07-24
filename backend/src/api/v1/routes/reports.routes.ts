// src/api/v1/routes/reports.routes.ts
//
// Mount in src/api/v1/index.ts, same prefix as other examiner routes:
//   import reportsRoutes from "./routes/reports.routes";
//   router.use("/examiner", reportsRoutes);
//
// Resulting endpoints:
//   GET /api/v1/examiner/reports/exams                     — summary list
//   GET /api/v1/examiner/reports/exams/:examId              — full detail (JSON, used by the "View" button)
//   GET /api/v1/examiner/reports/exams/:examId/export       — CSV download
//   GET /api/v1/examiner/reports/exams/:examId/export/pdf   — PDF download

import { Router } from "express";

import {
  exportExamReportCsv,
  exportExamReportPdf,
  getExamReport,
  listExamReports,
} from "../controllers/reports.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, requireRoles("EXAMINER", "ADMIN"));

router.get("/reports/exams", listExamReports);
router.get("/reports/exams/:examId", getExamReport);
router.get("/reports/exams/:examId/export", exportExamReportCsv);
router.get("/reports/exams/:examId/export/pdf", exportExamReportPdf);

export default router;
