import { Router } from 'express';

import { translateContent } from '../../../controllers/content.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { validateBody } from '../../../middlewares/validate.middleware';
import { translateContentSchema } from '../../../schemas/content.schema';

const router = Router();

// Any authenticated user — Student, Examiner, or Admin — can request a
// translation. Unlike most other modules here, this one is genuinely
// shared across all three dashboards (question bank, exam titles,
// submissions/reports all need it), so there's no requireRoles gate.
router.use(authenticate);

router.post('/translate', validateBody(translateContentSchema), translateContent);

export default router;
