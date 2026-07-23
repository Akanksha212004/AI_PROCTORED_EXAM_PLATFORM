// import { Router } from "express";

// import { getCurrentUser } from "../controllers/user.controller";
// import { authenticate } from "../../../middlewares/auth.middleware";

// const router = Router();

// router.get("/me", authenticate, getCurrentUser);

// export default router;







import { Router } from "express";

import { changePassword, getCurrentUser, updateProfile } from "../controllers/user.controller";
import { authenticate } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { changePasswordSchema, updateProfileSchema } from "../../../schemas/user.schema";


const router = Router();

router.get("/me", authenticate, getCurrentUser);
router.get("/me", authenticate, validateBody(updateProfileSchema), updateProfile);
router.get("/me/change-password", authenticate, validateBody(changePasswordSchema), changePassword);

export default router;
