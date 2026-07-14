// src/api/v1/routes/submission.routes.ts
//
// Mount in src/api/v1/index.ts:
//   import submissionRoutes from "./routes/submission.routes";
//   router.use("/submissions", submissionRoutes);

import { Router } from "express";

import {
  listSubmissions,
  getSubmission,
  gradeAnswer,
  finalizeSubmission,
} from "../controllers/submission.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { gradeAnswerSchema } from "../../../schemas/submission.schema";

const router = Router();

router.use(authenticate, requireRoles("EXAMINER", "ADMIN"));

router.get("/", listSubmissions);
router.get("/:id", getSubmission);
router.post("/:id/finalize", finalizeSubmission);
router.post("/answers/:answerId/grade", validateBody(gradeAnswerSchema), gradeAnswer);

export default router;
