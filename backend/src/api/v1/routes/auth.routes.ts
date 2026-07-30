
import { Router } from "express";

import {
  getExaminerRequestStatus,
  login,
  register,
  requestExaminerAccess,
  resubmitExaminerAccessRequest,
} from "../controllers/auth.controller";
import { validateBody } from "../../../middlewares/validate.middleware";
import { validateQuery } from "../../../middlewares/validateQuery.middleware";
import { loginSchema } from "../../../schemas/auth.schema";
import { registerSchema } from "../../../schemas/user.schema";
import {
  examinerRequestStatusQuerySchema,
  requestExaminerAccessSchema,
  resubmitExaminerAccessRequestSchema,
} from "../../../schemas/examinerAccess.schema";

const router = Router();

// Student self-registration only — see registerSchema.
router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);

// Public "Request Examiner Access" — creates a PENDING examiner
// account; login is blocked until an admin approves it.
router.post(
  "/examiner-access-request",
  validateBody(requestExaminerAccessSchema),
  requestExaminerAccess
);

// Public "View Request Status" — look up by Request ID or email, no
// auth required. Used by the Examiner Portal's status page.
router.get(
  "/examiner-access-request/status",
  validateQuery(examinerRequestStatusQuerySchema),
  getExaminerRequestStatus
);

// Public "Edit & Resubmit" — only works while the request is REJECTED;
// resets it back to PENDING for another round of admin review.
router.patch(
  "/examiner-access-request/:requestId/resubmit",
  validateBody(resubmitExaminerAccessRequestSchema),
  resubmitExaminerAccessRequest
);

export default router;
