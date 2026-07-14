// src/services/dashboardSummary.service.ts

import * as repo from "../repositories/dashboardSummary.repository";

const RECENT_ACTIVITY_LIMIT = 8;
const UPCOMING_EXAMS_LIMIT = 5;
const PER_SOURCE_FETCH_LIMIT = 8; // fetch a few extra per source before merging+slicing

interface ActivityItem {
  type: "question_added" | "exam_created" | "submission" | "graded";
  message: string;
  timestamp: Date;
}

function truncate(text: string, max = 50): string {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export async function getDashboardSummary(examinerId: string) {
  const [
    totalQuestions,
    totalExams,
    pendingGradingCount,
    finalizedSessions,
    recentQuestions,
    recentExams,
    recentSubmissions,
    recentGradings,
    upcomingExams,
  ] = await Promise.all([
    repo.countQuestions(examinerId),
    repo.countExams(examinerId),
    repo.countPendingGradings(examinerId),
    repo.findFinalizedSessionsForAverage(examinerId),
    repo.findRecentQuestions(examinerId, PER_SOURCE_FETCH_LIMIT),
    repo.findRecentExams(examinerId, PER_SOURCE_FETCH_LIMIT),
    repo.findRecentSubmissions(examinerId, PER_SOURCE_FETCH_LIMIT),
    repo.findRecentGradings(examinerId, PER_SOURCE_FETCH_LIMIT),
    repo.findUpcomingExams(examinerId, UPCOMING_EXAMS_LIMIT),
  ]);

  // Average score, as a percentage of max possible marks, across
  // finalized sessions. Sessions with 0 max marks (misconfigured/no
  // questions) are excluded to avoid division by zero skewing the average.
  const scorable = finalizedSessions.filter((s) => s.maxMarks > 0);
  const averageScore =
    scorable.length === 0
      ? null
      : Math.round(
          (scorable.reduce((sum, s) => sum + s.totalMarks / s.maxMarks, 0) / scorable.length) * 100
        );

  const activity: ActivityItem[] = [
    ...recentQuestions.map((q) => ({
      type: "question_added" as const,
      message: `You added a new question: "${truncate(q.questionText)}"`,
      timestamp: q.createdAt,
    })),
    ...recentExams.map((e) => ({
      type: "exam_created" as const,
      message: `You created exam "${e.title}"`,
      timestamp: e.createdAt,
    })),
    ...recentSubmissions.map((s) => ({
      type: "submission" as const,
      message: `${s.student.name} submitted "${s.exam.title}"`,
      timestamp: s.endTime ?? new Date(0),
    })),
    ...recentGradings.map((g) => ({
      type: "graded" as const,
      message: `You graded ${g.answer.student.name}'s answer for "${g.answer.examSession.exam.title}"`,
      timestamp: g.gradedAt ?? new Date(0),
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, RECENT_ACTIVITY_LIMIT);

  return {
    totalQuestions,
    totalExams,
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
