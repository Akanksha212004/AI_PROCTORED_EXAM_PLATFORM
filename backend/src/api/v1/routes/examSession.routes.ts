// src/api/v1/routes/examSession.routes.ts
//
// Mount in src/api/v1/index.ts (add these 2 lines):
//   import examSessionRoutes from "./routes/examSession.routes";
//   router.use("/sessions", examSessionRoutes);
//
// The "start a session" route (POST /exams/:examId/sessions) is added
// to exam.routes.ts instead, since it's nested under /exams — see the
// separate patch instructions for that file.

import { Router } from "express";

import {
  getSession,
  submitAnswer,
  submitAnswerFile,
  submitSession,
  listMySubmissions,
  getMySubmissionReport 
} from "../controllers/examSession.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { submitAnswerSchema } from "../../../schemas/examSession.schema";
import { uploadAnswerFile } from "../../../middlewares/uploadAnswerFile.middleware";

const router = Router();

// All session actions are student-only — an examiner reviews finished
// sessions through the separate "Submissions to Review" module.
router.use(authenticate, requireRoles("STUDENT"));

router.get("/mine", listMySubmissions);
router.get("/:id", getSession);
router.get("/:id/report", getMySubmissionReport);
router.post("/:id/answers", validateBody(submitAnswerSchema), submitAnswer);
router.post("/:id/answers/:questionId/upload", uploadAnswerFile, submitAnswerFile);
router.post("/:id/submit", submitSession);

export default router;
