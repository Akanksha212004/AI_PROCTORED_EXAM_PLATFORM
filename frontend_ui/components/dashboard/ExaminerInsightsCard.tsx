"use client";

import { TrendingUp } from "lucide-react";
import Link from "next/link";

import { useDashboardSummary } from "@/hooks/useDashboardSummary";

export function ExaminerInsightsCard() {
  const { summary, isLoading } = useDashboardSummary();

  return (
    <div className="rounded-xl border border-border bg-surface-muted p-4">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-paper">
        <TrendingUp className="h-4 w-4 text-accent-violet" />
        Insights
      </p>

      {isLoading || !summary ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 w-full animate-pulse rounded bg-surface" />
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5 text-xs leading-relaxed text-paper/70">
          <li>
            •{" "}
            {summary.pendingGradingCount > 0
              ? `${summary.pendingGradingCount} submission${summary.pendingGradingCount === 1 ? "" : "s"} awaiting review`
              : "All submissions graded"}
          </li>
          <li>
            •{" "}
            {summary.upcomingExams.length > 0
              ? `${summary.upcomingExams.length} exam${summary.upcomingExams.length === 1 ? "" : "s"} scheduled`
              : "No exams scheduled yet"}
          </li>
          <li>• {summary.averageScore !== null ? `Average score is ${summary.averageScore}%` : "No graded results yet"}</li>
          <li>
            • {summary.totalQuestions} question{summary.totalQuestions === 1 ? "" : "s"} in your bank
          </li>
        </ul>
      )}

      <Link
        href="/dashboard/examiner/submissions"
        className="mt-3 inline-block text-xs font-medium text-accent-sky transition-colors hover:text-accent-skyHover hover:underline"
      >
        View submissions →
      </Link>
    </div>
  );
}
