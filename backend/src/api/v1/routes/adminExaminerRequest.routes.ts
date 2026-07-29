// src/api/v1/routes/adminExaminerRequest.routes.ts
//
// Mounted in src/api/v1/index.ts under /admin (ADMIN only):
//   GET   /api/v1/admin/examiner-requests?status=PENDING&page=&limit=
//   PATCH /api/v1/admin/examiner-requests/:userId/approve
//   PATCH /api/v1/admin/examiner-requests/:userId/reject

import { Router } from "express";

import {
  approveExaminerRequest,
  listExaminerRequests,
  rejectExaminerRequest,
} from "../controllers/adminExaminerRequest.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { rejectExaminerRequestSchema } from "../../../schemas/examinerAccess.schema";

const router = Router();

router.use(authenticate, requireRoles("ADMIN"));

router.get("/examiner-requests", listExaminerRequests);
router.patch("/examiner-requests/:userId/approve", approveExaminerRequest);
router.patch(
  "/examiner-requests/:userId/reject",
  validateBody(rejectExaminerRequestSchema),
  rejectExaminerRequest
);

export default router;
