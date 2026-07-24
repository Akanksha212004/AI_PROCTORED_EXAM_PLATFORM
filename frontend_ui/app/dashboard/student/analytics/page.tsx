"use client";

// app/dashboard/student/analytics/page.tsx
//
// Student-facing counterpart of the examiner's Analytics page. Reuses the exact
// same chart components (ScoreTrendChart, PassFailDonut, ExamComparisonTable) —
// just fed with the student's own submissions instead of an examiner-scoped
// endpoint, since there's no dedicated /student/analytics API yet.

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { PassFailDonut } from "@/components/dashboard/PassFailDonut";
import { ExamComparisonTable } from "@/components/dashboard/ExamComparisonTable";
import { StudentSubjectPerformanceCard } from "@/components/dashboard/StudentSubjectPerformanceCard";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import type { ScoreTrendPoint, PassFailRate, ExamComparisonRow } from "@/hooks/useAnalytics";
import type { MySubmissionListItem } from "@/types/examSession";

const WEEKS = 8;

function isGraded(s: MySubmissionListItem) {
  return (s.gradingStatus === "FULLY_AUTO_GRADED" || s.gradingStatus === "FULLY_GRADED") && s.maxMarks > 0;
}

function scorePercent(s: MySubmissionListItem) {
  return Math.round((s.totalMarks / s.maxMarks) * 100);
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday as week start
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildScoreTrend(submissions: MySubmissionListItem[]): ScoreTrendPoint[] {
  const graded = submissions.filter((s) => isGraded(s) && s.submittedAt);
  const now = startOfWeek(new Date());
  const weekStarts: Date[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const w = new Date(now);
    w.setDate(w.getDate() - i * 7);
    weekStarts.push(w);
  }

  return weekStarts.map((weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const inWeek = graded.filter((s) => {
      const t = new Date(s.submittedAt as string).getTime();
      return t >= weekStart.getTime() && t < weekEnd.getTime();
    });
    const attempts = inWeek.length;
    const averageScore =
      attempts > 0 ? Math.round(inWeek.reduce((sum, s) => sum + scorePercent(s), 0) / attempts) : null;
    return { weekStart: weekStart.toISOString(), averageScore, attempts };
  });
}

function buildPassFailRate(submissions: MySubmissionListItem[]): PassFailRate {
  const graded = submissions.filter(isGraded);
  const passed = graded.filter((s) => s.totalMarks >= s.passingMarks).length;
  const total = graded.length;
  return { passed, failed: total - passed, total, passRate: total > 0 ? Math.round((passed / total) * 100) : null };
}

function buildExamComparison(submissions: MySubmissionListItem[]): ExamComparisonRow[] {
  const graded = submissions.filter(isGraded);
  const byExam = new Map<
    string,
    { examTitle: string; subject: string; sum: number; attempts: number; passed: number; latest: number }
  >();

  for (const s of graded) {
    const entry = byExam.get(s.examId) ?? {
      examTitle: s.examTitle,
      subject: s.examSubject,
      sum: 0,
      attempts: 0,
      passed: 0,
      latest: 0,
    };
    entry.sum += scorePercent(s);
    entry.attempts += 1;
    if (s.totalMarks >= s.passingMarks) entry.passed += 1;
    entry.latest = Math.max(entry.latest, s.submittedAt ? new Date(s.submittedAt).getTime() : 0);
    byExam.set(s.examId, entry);
  }

  return Array.from(byExam.entries())
    .map(([examId, e]) => ({
      examId,
      examTitle: e.examTitle,
      subject: e.subject,
      attempts: e.attempts,
      averageScore: Math.round(e.sum / e.attempts),
      passRate: Math.round((e.passed / e.attempts) * 100),
      latest: e.latest,
    }))
    .sort((a, b) => b.latest - a.latest)
    .map(({ latest, ...row }) => row);
}

export default function StudentAnalyticsPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <DashboardShell>
        <AnalyticsContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function AnalyticsContent() {
  const { examHistory, subjectPerformance, isLoadingSubmissions } = useStudentDashboard();
  const router = useRouter();

  const scoreTrend = buildScoreTrend(examHistory);
  const passFailRate = buildPassFailRate(examHistory);
  const examComparison = buildExamComparison(examHistory);

  return (
    <div className="space-y-6 pb-4">
      <button
        onClick={() => router.push("/dashboard/student")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-paper/60 transition-colors hover:text-paper"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">Analytics</h1>
        <p className="mt-1.5 text-sm text-paper/60">
          Based on your graded submissions, last {WEEKS} weeks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <ScoreTrendChart data={scoreTrend} isLoading={isLoadingSubmissions} />
        <PassFailDonut data={passFailRate} isLoading={isLoadingSubmissions} />
      </div>

      <StudentSubjectPerformanceCard data={subjectPerformance} isLoading={isLoadingSubmissions} />

      <ExamComparisonTable data={examComparison} isLoading={isLoadingSubmissions} />
    </div>
  );
}
