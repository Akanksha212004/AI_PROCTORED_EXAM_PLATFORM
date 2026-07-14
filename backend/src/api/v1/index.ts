/**
 * Equivalent of `app/api/v1/router.py`. Future modules register here:
 *
 *   import questionRoutes from "./routes/question.routes";
 *   router.use("/questions", questionRoutes);
 */
import { Router } from "express";
import examSessionRoutes from "./routes/examSession.routes";

import authRoutes from "./routes/auth.routes";
import examRoutes from "./routes/exam.routes";
import questionRoutes from "./routes/question.routes";
import userRoutes from "./routes/user.routes";

import proctorEventRoutes from "./routes/proctorEvent.routes";

import dashboardSummaryRoutes from "./routes/dashboardSummary.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/questions", questionRoutes);
router.use("/exams", examRoutes);

router.use("/sessions", examSessionRoutes);

router.use("/proctoring", proctorEventRoutes);

router.use("/examiner", dashboardSummaryRoutes);

export default router;
