// types/dashboard.ts

export type ActivityType = "question_added" | "exam_created" | "submission" | "graded";

export interface RecentActivityItem {
  type: ActivityType;
  message: string;
  timestamp: string;
}

export interface UpcomingExamItem {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  durationMinutes: number;
}

export interface DashboardSummary {
  totalQuestions: number;
  totalExams: number;
  pendingGradingCount: number;
  averageScore: number | null; // percentage, or null if no finalized sessions yet
  recentActivity: RecentActivityItem[];
  upcomingExams: UpcomingExamItem[];
}
