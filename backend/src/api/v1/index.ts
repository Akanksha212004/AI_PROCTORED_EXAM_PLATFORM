
// /**
//  * Equivalent of `app/api/v1/router.py`. Future modules register here:
//  *
//  *   import questionRoutes from "./routes/question.routes";
//  *   router.use("/questions", questionRoutes);
//  */
// import { Router } from "express";
// import examSessionRoutes from "./routes/examSession.routes";

// import authRoutes from "./routes/auth.routes";
// import examRoutes from "./routes/exam.routes";
// import questionRoutes from "./routes/question.routes";
// import userRoutes from "./routes/user.routes";

// import proctorEventRoutes from "./routes/proctorEvent.routes";

// import dashboardSummaryRoutes from "./routes/dashboardSummary.routes";
// import notificationRoutes from "./routes/notification.routes";

// import submissionRoutes from "./routes/submission.routes";

// const router = Router();

// router.use("/auth", authRoutes);
// router.use("/users", userRoutes);
// router.use("/questions", questionRoutes);
// router.use("/exams", examRoutes);

// router.use("/sessions", examSessionRoutes);

// router.use("/submissions", submissionRoutes);

// router.use("/proctoring", proctorEventRoutes);

// router.use("/examiner", dashboardSummaryRoutes);
// router.use("/examiner", notificationRoutes);

// export default router;







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

import analyticsRoutes from "./routes/analytics.routes";
import dashboardSummaryRoutes from "./routes/dashboardSummary.routes";
import notificationRoutes from "./routes/notification.routes";
import reportsRoutes from "./routes/reports.routes";
import settingsRoutes from "./routes/settings.routes";
import studentRoutes from "./routes/student.routes";

import submissionRoutes from "./routes/submission.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/users", settingsRoutes);
router.use("/questions", questionRoutes);
router.use("/exams", examRoutes);

router.use("/sessions", examSessionRoutes);

router.use("/submissions", submissionRoutes);

router.use("/proctoring", proctorEventRoutes);

router.use("/examiner", dashboardSummaryRoutes);
router.use("/examiner", notificationRoutes);
router.use("/examiner", studentRoutes);
router.use("/examiner", analyticsRoutes);
router.use("/examiner", reportsRoutes);

export default router;
