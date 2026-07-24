
"use client";

// hooks/useStudentDashboard.ts

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { examSessionService } from "@/services/examSessionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { AvailableExam, MySubmissionListItem } from "@/types/examSession";
import type { RecentActivityItem } from "@/types/dashboard";

export type ExamAvailability = "live" | "upcoming" | "closed";

export interface StudentExamCardData extends AvailableExam {
  availability: ExamAvailability;
}

export interface StudentDashboardStats {
  liveCount: number;
  todayCount: number;
  upcomingCount: number;
}

export interface StudentPerformanceStats {
  completedCount: number;
  pendingReviewCount: number;
  averageScore: number | null;
  bestScore: number | null;
  lowestScore: number | null;
}

/** Same shape the examiner-side SubjectPerformanceCard already expects, so it renders the student's own data unmodified. */
export interface StudentSubjectPerformance {
  subject: string;
  averageScore: number | null;
  attempts: number;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function deriveAvailability(exam: AvailableExam, now: number): ExamAvailability {
  const start = new Date(exam.startTime).getTime();
  const end = new Date(exam.endTime).getTime();
  if (now >= start && now <= end) return "live";
  if (now < start) return "upcoming";
  return "closed";
}

const RECENT_RESULTS_COUNT = 3;

export function useStudentDashboard() {
  const [exams, setExams] = useState<AvailableExam[]>([]);
  const [submissions, setSubmissions] = useState<MySubmissionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await examSessionService.listAvailable();
      setExams(data);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setIsLoadingSubmissions(true);
    try {
      const data = await examSessionService.listMine(1, 100);
      setSubmissions(data.items);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchSubmissions();
  }, [fetchDashboard, fetchSubmissions]);

  const now = Date.now();
  const today = new Date();

  const withAvailability: StudentExamCardData[] = exams.map((exam) => ({
    ...exam,
    availability: deriveAvailability(exam, now),
  }));

  const todaysExams = withAvailability
    .filter(
      (exam) => exam.availability === "live" || isSameDay(new Date(exam.startTime), today)
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const upcomingExams = withAvailability
    .filter(
      (exam) => exam.availability === "upcoming" && !isSameDay(new Date(exam.startTime), today)
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const stats: StudentDashboardStats = {
    liveCount: withAvailability.filter((e) => e.availability === "live").length,
    todayCount: todaysExams.length,
    upcomingCount: withAvailability.filter((e) => e.availability === "upcoming").length,
  };

  const examHistory = [...submissions].sort(
    (a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime()
  );

  const recentResults = examHistory
    .filter((s) => s.gradingStatus === "FULLY_AUTO_GRADED" || s.gradingStatus === "FULLY_GRADED")
    .slice(0, RECENT_RESULTS_COUNT);

  const gradedSubmissions = submissions.filter(
    (s) =>
      (s.gradingStatus === "FULLY_AUTO_GRADED" || s.gradingStatus === "FULLY_GRADED") && s.maxMarks > 0
  );

  const scorePercents = gradedSubmissions.map((s) => Math.round((s.totalMarks / s.maxMarks) * 100));

  const performance: StudentPerformanceStats = {
    completedCount: submissions.length,
    pendingReviewCount: submissions.filter((s) => s.gradingStatus === "PENDING_REVIEW").length,
    averageScore:
      scorePercents.length > 0
        ? Math.round(scorePercents.reduce((sum, p) => sum + p, 0) / scorePercents.length)
        : null,
    bestScore: scorePercents.length > 0 ? Math.max(...scorePercents) : null,
    lowestScore: scorePercents.length > 0 ? Math.min(...scorePercents) : null,
  };

  const subjectMap = new Map<string, { totalPercent: number; attempts: number }>();
  for (const s of gradedSubmissions) {
    const percent = Math.round((s.totalMarks / s.maxMarks) * 100);
    const entry = subjectMap.get(s.examSubject) ?? { totalPercent: 0, attempts: 0 };
    entry.totalPercent += percent;
    entry.attempts += 1;
    subjectMap.set(s.examSubject, entry);
  }

  const subjectPerformance: StudentSubjectPerformance[] = Array.from(subjectMap.entries())
    .map(([subject, { totalPercent, attempts }]) => ({
      subject,
      averageScore: Math.round(totalPercent / attempts),
      attempts,
    }))
    .sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0));

  const recentActivity: RecentActivityItem[] = examHistory
    .filter((s) => s.submittedAt)
    .slice(0, 6)
    .map((s) => ({
      type: s.gradingStatus === "PENDING_REVIEW" ? "submission" : "graded",
      message:
        s.gradingStatus === "PENDING_REVIEW"
          ? `Exam submitted: ${s.examTitle}`
          : `Result published: ${s.examTitle}`,
      timestamp: s.submittedAt as string,
    }));

  return {
    isLoading,
    isLoadingSubmissions,
    todaysExams,
    upcomingExams,
    stats,
    performance,
    subjectPerformance,
    recentActivity,
    examHistory,
    recentResults,
    refetch: fetchDashboard,
  };
}