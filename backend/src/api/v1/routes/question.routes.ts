// import { Router } from "express";

// import {
//   createQuestion,
//   deleteQuestion,
//   getQuestion,
//   listQuestions,
//   updateQuestion,
//   uploadQuestionModelAnswer,
// } from "../controllers/question.controller";
// import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
// import { validateBody } from "../../../middlewares/validate.middleware";
// import { validateQuery } from "../../../middlewares/validateQuery.middleware";
// import { uploadModelAnswer } from "../../../middlewares/upload.middleware";
// import { createQuestionSchema, listQuestionsQuerySchema, updateQuestionSchema } from "../../../schemas/question.schema";

// const router = Router();

// // Every question-bank route requires auth; writes are Examiner/Admin only.
// router.use(authenticate);

// router.post("/", requireRoles("EXAMINER", "ADMIN"), validateBody(createQuestionSchema), createQuestion);
// router.get("/", requireRoles("EXAMINER", "ADMIN"), validateQuery(listQuestionsQuerySchema), listQuestions);
// router.get("/:id", requireRoles("EXAMINER", "ADMIN"), getQuestion);
// router.put("/:id", requireRoles("EXAMINER", "ADMIN"), validateBody(updateQuestionSchema), updateQuestion);
// router.delete("/:id", requireRoles("EXAMINER", "ADMIN"), deleteQuestion);

// // Handwritten model-answer upload â€” SUBJECTIVE/PARAGRAPH questions only,
// // enforced in questionService.attachModelAnswer.
// router.post(
//   "/:id/model-answer",
//   requireRoles("EXAMINER", "ADMIN"),
//   uploadModelAnswer,
//   uploadQuestionModelAnswer
// );

// export default router;







import { Router } from "express";

import {
  createQuestion,
  deleteQuestion,
  getQuestion,
  listQuestions,
  updateQuestion,
  uploadQuestionModelAnswer,
} from "../controllers/question.controller";
import { parseBulkImportFile, confirmBulkImport } from "../controllers/bulkImport.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { validateQuery } from "../../../middlewares/validateQuery.middleware";
import { uploadModelAnswer } from "../../../middlewares/upload.middleware";
import { uploadBulkImportFile } from "../../../middlewares/uploadBulkImport.middleware";
import { createQuestionSchema, listQuestionsQuerySchema, updateQuestionSchema } from "../../../schemas/question.schema";

const router = Router();

router.use(authenticate);

router.post("/", requireRoles("EXAMINER", "ADMIN"), validateBody(createQuestionSchema), createQuestion);
router.get("/", requireRoles("EXAMINER", "ADMIN"), validateQuery(listQuestionsQuerySchema), listQuestions);
router.get("/:id", requireRoles("EXAMINER", "ADMIN"), getQuestion);
router.put("/:id", requireRoles("EXAMINER", "ADMIN"), validateBody(updateQuestionSchema), updateQuestion);
router.delete("/:id", requireRoles("EXAMINER", "ADMIN"), deleteQuestion);

router.post(
  "/:id/model-answer",
  requireRoles("EXAMINER", "ADMIN"),
  uploadModelAnswer,
  uploadQuestionModelAnswer
);

// Bulk import — Step 1: parse only. Confirm/save endpoint comes next,
// once this parse step is reviewed.
router.post(
  "/bulk-import/parse",
  requireRoles("EXAMINER", "ADMIN"),
  uploadBulkImportFile,
  parseBulkImportFile
);

router.post(
  "/bulk-import/confirm",
  requireRoles("EXAMINER", "ADMIN"),
  confirmBulkImport
);


export default router;