

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

import adminDashboardRoutes from "./routes/adminDashboard.routes";
import adminUserRoutes from "./routes/adminUser.routes";
import adminExaminerRequestRoutes from "./routes/adminExaminerRequest.routes";
import analyticsRoutes from "./routes/analytics.routes";
import dashboardSummaryRoutes from "./routes/dashboardSummary.routes";
import notificationRoutes from "./routes/notification.routes";
import reportsRoutes from "./routes/reports.routes";
import settingsRoutes from "./routes/settings.routes";
import studentRoutes from "./routes/student.routes";

import submissionRoutes from "./routes/submission.routes";
import contentRoutes from "./routes/content.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/users", settingsRoutes);
router.use("/questions", questionRoutes);
router.use("/exams", examRoutes);

router.use("/sessions", examSessionRoutes);

router.use("/submissions", submissionRoutes);

// Dynamic-content machine translation (question text, exam titles,
// feedback, etc.) — shared across Student, Examiner, and Admin
// dashboards alike, unlike most modules above which are role-specific.
router.use("/content", contentRoutes);

router.use("/proctoring", proctorEventRoutes);

router.use("/examiner", dashboardSummaryRoutes);
router.use("/examiner", notificationRoutes);
router.use("/examiner", studentRoutes);
router.use("/examiner", analyticsRoutes);
router.use("/examiner", reportsRoutes);

// Platform-wide admin-only modules: user directory (all roles) + a
// platform-wide dashboard summary. Everything else an admin needs
// (exams, questions, submissions, live sessions, reports, analytics)
// is already served by the routes above, since every one of them
// treats the ADMIN role as "sees/manages everything" (see exam.service,
// question.service, submission.service).
router.use("/admin", adminDashboardRoutes);
router.use("/admin", adminUserRoutes);
router.use("/admin", adminExaminerRequestRoutes);

export default router;
