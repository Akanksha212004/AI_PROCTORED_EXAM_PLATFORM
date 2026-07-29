// src/services/adminDashboard.service.ts

import * as repo from "../repositories/adminDashboard.repository";

const RECENT_ACTIVITY_LIMIT = 8;
const UPCOMING_EXAMS_LIMIT = 5;
const PER_SOURCE_FETCH_LIMIT = 8; // fetch a few extra per source before merging+slicing

interface ActivityItem {
  type: "question_added" | "exam_created" | "submission" | "graded" | "user_registered";
  message: string;
  timestamp: Date;
}

function truncate(text: string, max = 50): string {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export async function getDashboardSummary() {
  const [
    usersByRole,
    activeUsers,
    totalQuestions,
    totalExams,
    liveSessionsNow,
    pendingGradingCount,
    finalizedSessions,
    recentQuestions,
    recentExams,
    recentSubmissions,
    recentGradings,
    recentUsers,
    upcomingExams,
  ] = await Promise.all([
    repo.countUsersByRole(),
    repo.countActiveUsers(),
    repo.countQuestions(),
    repo.countExams(),
    repo.countLiveSessionsNow(),
    repo.countPendingGradings(),
    repo.findFinalizedSessionsForAverage(),
    repo.findRecentQuestions(PER_SOURCE_FETCH_LIMIT),
    repo.findRecentExams(PER_SOURCE_FETCH_LIMIT),
    repo.findRecentSubmissions(PER_SOURCE_FETCH_LIMIT),
    repo.findRecentGradings(PER_SOURCE_FETCH_LIMIT),
    repo.findRecentUsers(PER_SOURCE_FETCH_LIMIT),
    repo.findUpcomingExams(UPCOMING_EXAMS_LIMIT),
  ]);

  // Average score, as a percentage of max possible marks, across every
  // finalized session on the platform. Sessions with 0 max marks
  // (misconfigured/no questions) are excluded to avoid skewing the average.
  const scorable = finalizedSessions.filter((s) => s.maxMarks > 0);
  const averageScore =
    scorable.length === 0
      ? null
      : Math.round(
          (scorable.reduce((sum, s) => sum + s.totalMarks / s.maxMarks, 0) / scorable.length) * 100
        );

  const totalUsers = usersByRole.STUDENT + usersByRole.EXAMINER + usersByRole.ADMIN;

  const activity: ActivityItem[] = [
    ...recentQuestions.map((q) => ({
      type: "question_added" as const,
      message: `${q.createdBy?.name ?? "Someone"} added a new question: "${truncate(q.questionText)}"`,
      timestamp: q.createdAt,
    })),
    ...recentExams.map((e) => ({
      type: "exam_created" as const,
      message: `${e.createdBy?.name ?? "Someone"} created exam "${e.title}"`,
      timestamp: e.createdAt,
    })),
    ...recentSubmissions.map((s) => ({
      type: "submission" as const,
      message: `${s.student.name} submitted "${s.exam.title}"`,
      timestamp: s.endTime ?? new Date(0),
    })),
    ...recentGradings.map((g) => ({
      type: "graded" as const,
      message: `${g.examiner?.name ?? "An examiner"} graded ${g.answer.student.name}'s answer for "${g.answer.examSession.exam.title}"`,
      timestamp: g.gradedAt ?? new Date(0),
    })),
    ...recentUsers.map((u) => ({
      type: "user_registered" as const,
      message: `${u.name} joined as ${u.role.toLowerCase()}`,
      timestamp: u.createdAt,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, RECENT_ACTIVITY_LIMIT);

  return {
    totalUsers,
    totalStudents: usersByRole.STUDENT,
    totalExaminers: usersByRole.EXAMINER,
    totalAdmins: usersByRole.ADMIN,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    totalQuestions,
    totalExams,
    liveSessionsNow,
    pendingGradingCount,
    averageScore, // percentage, 0-100, or null if no finalized sessions yet
    recentActivity: activity.map((a) => ({
      type: a.type,
      message: a.message,
      timestamp: a.timestamp,
    })),
    upcomingExams: upcomingExams.map((e) => ({
      id: e.id,
      title: e.title,
      subject: e.subject,
      startTime: e.startTime,
      durationMinutes: e.durationMinutes,
    })),
  };
}
