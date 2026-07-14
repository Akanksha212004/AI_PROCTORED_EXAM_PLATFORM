// src/api/v1/routes/proctorEvent.routes.ts
//
// Mounted separately at /proctoring (not folded into exam-session
// routes) because examSession.routes.ts applies a blanket
// requireRoles("STUDENT") to everything in that file — mixing an
// EXAMINER-only route in there would need restructuring it. This file
// is purely additive.
//
// Mount in src/api/v1/index.ts:
//   import proctorEventRoutes from "./routes/proctorEvent.routes";
//   router.use("/proctoring", proctorEventRoutes);
//
// Resulting endpoints:
//   POST /api/v1/proctoring/sessions/:id/events            (student)
//   POST /api/v1/proctoring/sessions/:id/events/snapshot   (student)
//   GET  /api/v1/proctoring/sessions/:id/events             (examiner/admin)
//   GET  /api/v1/proctoring/live-sessions                   (examiner/admin)
//
// NOTE ON "LIVE": no WebSocket push here — the frontend polls
// GET /live-sessions every ~10s. A true real-time push (Socket.IO/ws)
// would need new server infra (connection management, auth-over-ws)
// that wasn't already in this stack; polling gets ~90% of the practical
// benefit for a fraction of the complexity. Flagging this rather than
// silently pretending it's real-time.

import { Router } from "express";

import {
  submitEvent,
  submitSnapshot,
  getSessionEvents,
  getLiveSessions,
} from "../controllers/proctorEvent.controller";
import { authenticate, requireRoles } from "../../../middlewares/auth.middleware";
import { validateBody } from "../../../middlewares/validate.middleware";
import { submitProctorEventSchema } from "../../../schemas/proctorEvent.schema";
import { uploadProctorSnapshot } from "../../../middlewares/uploadProctorSnapshot.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/sessions/:id/events",
  requireRoles("STUDENT"),
  validateBody(submitProctorEventSchema),
  submitEvent
);
router.post("/sessions/:id/events/snapshot", requireRoles("STUDENT"), uploadProctorSnapshot, submitSnapshot);

router.get("/sessions/:id/events", requireRoles("EXAMINER", "ADMIN"), getSessionEvents);
router.get("/live-sessions", requireRoles("EXAMINER", "ADMIN"), getLiveSessions);

export default router;
