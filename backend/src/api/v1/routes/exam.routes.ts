// import { Router } from "express";

// import {
//   createExam,
//   deleteExam,
//   getExam,
//   listExams,
//   startExamSession,
//   updateExam,
// } from "../controllers/exam.controller";
// import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
// import { validateBody } from "../../../middlewares/validate.middleware";
// import { createExamSchema, updateExamSchema } from "../../../schemas/exam.schema";

// const router = Router();

// router.use(authenticate);

// router.post("/", requireRoles("EXAMINER", "ADMIN"), validateBody(createExamSchema), createExam);
// router.get("/", listExams); // role-scoped inside examService.list — students see only open exams
// router.get("/:id", getExam);
// router.put("/:id", requireRoles("EXAMINER", "ADMIN"), validateBody(updateExamSchema), updateExam);
// router.delete("/:id", requireRoles("EXAMINER", "ADMIN"), deleteExam);

// // Student opens/resumes their randomized attempt.
// router.post("/:id/start", requireRoles("STUDENT"), startExamSession);

// export default router;




// src/api/v1/routes/exam.routes.ts
//
// Already wired into src/api/v1/index.ts:
//   import examRoutes from "./routes/exam.routes";
//   router.use("/exams", examRoutes);
// No changes needed there — this file just needs to exist at this path.

import { Router } from "express";
import { startSession } from "../controllers/examSession.controller";

import {
  createExam,
  deleteExam,
  getExam,
  listExams,
  updateExam,
  addPoolQuestions,
  removePoolQuestion,
  listAvailableExams,
} from "../controllers/exam.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { validateQuery } from "../../../middlewares/validateQuery.middleware";
import {
  createExamSchema,
  listExamsQuerySchema,
  updateExamSchema,
  addPoolQuestionsSchema,
} from "../../../schemas/exam.schema";


const router = Router();
router.use(authenticate);

// Every exam-config route requires auth; all of them are Examiner/Admin
// only for now (students interact with exams via a separate module once
// the Timed Exam Engine exists).
router.use(authenticate);

router.post("/", requireRoles("EXAMINER", "ADMIN"), validateBody(createExamSchema), createExam);
router.get("/", requireRoles("EXAMINER", "ADMIN"), validateQuery(listExamsQuerySchema), listExams);

router.post("/:examId/sessions", requireRoles("STUDENT"), startSession);

router.get("/available", requireRoles("STUDENT"), listAvailableExams);

router.get("/:id", requireRoles("EXAMINER", "ADMIN"), getExam);
router.put("/:id", requireRoles("EXAMINER", "ADMIN"), validateBody(updateExamSchema), updateExam);
router.delete("/:id", requireRoles("EXAMINER", "ADMIN"), deleteExam);

// Curated question pool (alternative/supplement to auto-selection rules)
router.post(
  "/:id/questions",
  requireRoles("EXAMINER", "ADMIN"),
  validateBody(addPoolQuestionsSchema),
  addPoolQuestions
);
router.delete("/:id/questions/:questionId", requireRoles("EXAMINER", "ADMIN"), removePoolQuestion);

export default router;
