// import { Router } from "express";

// import { login, register } from "../controllers/auth.controller";
// import { validateBody } from "../../../middlewares/validate.middleware";
// import { loginSchema } from "../../../schemas/auth.schema";
// import { registerSchema } from "../../../schemas/user.schema";

// const router = Router();

// router.post("/register", validateBody(registerSchema), register);
// router.post("/login", validateBody(loginSchema), login);

// export default router;




import { Router } from "express";

import { login, register, requestExaminerAccess } from "../controllers/auth.controller";
import { validateBody } from "../../../middlewares/validate.middleware";
import { loginSchema } from "../../../schemas/auth.schema";
import { registerSchema } from "../../../schemas/user.schema";
import { requestExaminerAccessSchema } from "../../../schemas/examinerAccess.schema";

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

export default router;
