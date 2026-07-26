// src/api/v1/routes/student.routes.ts
//
// Mount in src/api/v1/index.ts, same prefix as dashboardSummaryRoutes:
//   import studentRoutes from "./routes/student.routes";
//   router.use("/examiner", studentRoutes);
//
// Resulting endpoints:
//   GET /api/v1/examiner/students?search=&page=&limit=
//   GET /api/v1/examiner/students/:studentId
//   PATCH /api/v1/examiner/students/:studentId/status

import { Router } from "express";

import { getStudent, listStudents, updateStudentStatus } from "../controllers/student.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { updateStudentStatusSchema } from "../../../schemas/student.schema";

const router = Router();

router.use(authenticate, requireRoles("EXAMINER", "ADMIN"));

router.get("/students", listStudents);
router.get("/students/:studentId", getStudent);
router.patch("/students/:studentId/status", validateBody(updateStudentStatusSchema), updateStudentStatus);

export default router;
