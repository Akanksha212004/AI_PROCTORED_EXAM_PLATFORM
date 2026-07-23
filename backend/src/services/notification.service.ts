// src/services/notification.service.ts
//
// Deliberately reuses dashboardSummary.repository's "recent X" finders
// instead of re-querying the same tables — this feed and the dashboard's
// "Recent Activity" card are the same underlying events, just presented
// differently (one has read/unread state, the other doesn't).

import * as dashboardSummaryRepo from "../repositories/dashboardSummary.repository";
import * as notificationRepo from "../repositories/notification.repository";

const DEFAULT_LIMIT = 15;
const PER_SOURCE_FETCH_LIMIT = 15;

export type NotificationType = "question_added" | "exam_created" | "submission" | "graded";

interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
}

function truncate(text: string, max = 50): string {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

async function buildFeed(examinerId: string, limit: number): Promise<NotificationItem[]> {
  const [recentQuestions, recentExams, recentSubmissions, recentGradings] = await Promise.all([
    dashboardSummaryRepo.findRecentQuestions(examinerId, PER_SOURCE_FETCH_LIMIT),
    dashboardSummaryRepo.findRecentExams(examinerId, PER_SOURCE_FETCH_LIMIT),
    dashboardSummaryRepo.findRecentSubmissions(examinerId, PER_SOURCE_FETCH_LIMIT),
    dashboardSummaryRepo.findRecentGradings(examinerId, PER_SOURCE_FETCH_LIMIT),
  ]);

  const items: NotificationItem[] = [
    ...recentQuestions.map((q) => ({
      id: `question_added-${q.id}`,
      type: "question_added" as const,
      message: `You added a new question: "${truncate(q.questionText)}"`,
      timestamp: q.createdAt,
    })),
    ...recentExams.map((e) => ({
      id: `exam_created-${e.id}`,
      type: "exam_created" as const,
      message: `You created exam "${e.title}"`,
      timestamp: e.createdAt,
    })),
    ...recentSubmissions.map((s) => ({
      id: `submission-${s.id}`,
      type: "submission" as const,
      message: `${s.student.name} submitted "${s.exam.title}"`,
      timestamp: s.endTime ?? new Date(0),
    })),
    ...recentGradings.map((g) => ({
      id: `graded-${g.id}`,
      type: "graded" as const,
      message: `You graded ${g.answer.student.name}'s answer for "${g.answer.examSession.exam.title}"`,
      timestamp: g.gradedAt ?? new Date(0),
    })),
  ];

  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}

export async function getNotifications(examinerId: string, limit: number = DEFAULT_LIMIT) {
  const [feed, seenAt] = await Promise.all([
    buildFeed(examinerId, limit),
    notificationRepo.getNotificationsSeenAt(examinerId),
  ]);

  const items = feed.map((item) => ({
    ...item,
    isUnread: seenAt === null || item.timestamp > seenAt,
  }));

  const unreadCount = items.filter((item) => item.isUnread).length;

  return { items, unreadCount, seenAt };
}

export async function markAllRead(examinerId: string) {
  const seenAt = await notificationRepo.markNotificationsSeenNow(examinerId);
  return { seenAt };
}
