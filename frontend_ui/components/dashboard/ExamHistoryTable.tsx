"use client";

// components/dashboard/ExamHistoryTable.tsx
//
// Compact preview table for the student dashboard — mirrors the full
// /dashboard/student/history page but trimmed to a handful of rows with
// a "View full history" link, matching the reference dashboard's layout.

import Link from "next/link";
import { History } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { GradingStatus, MySubmissionListItem } from "@/types/examSession";

interface Props {
  history: MySubmissionListItem[];
  isLoading: boolean;
  limit?: number;
}

function gradingBadgeTone(status: GradingStatus): "neutral" | "sky" | "amber" {
  return status === "PENDING_REVIEW" ? "amber" : "sky";
}

function gradingLabel(status: GradingStatus): string {
  return status === "PENDING_REVIEW" ? "Pending Review" : "Graded";
}

export function ExamHistoryTable({ history, isLoading, limit = 5 }: Props) {
  const rows = history.slice(0, limit);

  return (
    <Card interactive className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <History className="h-4 w-4 text-accent-violet" />
          Exam History
        </p>
        <Link href="/dashboard/student/history" className="text-xs font-medium text-accent-sky hover:text-accent-sky/80">
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">You haven&apos;t submitted any exams yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="pb-3 pr-3 font-medium">Exam</th>
                <th className="pb-3 pr-3 font-medium">Subject</th>
                <th className="pb-3 pr-3 font-medium">Date</th>
                <th className="pb-3 pr-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-3">
                    <Link
                      href={`/dashboard/student/report/${item.id}`}
                      className="font-medium text-paper transition-colors hover:text-accent-sky"
                    >
                      {item.examTitle}
                    </Link>
                  </td>
                  <td className="py-3 pr-3 text-paper/60">{item.examSubject}</td>
                  <td className="py-3 pr-3 text-paper/60">
                    {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 pr-3 font-medium text-paper/80">
                    {item.gradingStatus === "PENDING_REVIEW" ? (
                      "—"
                    ) : (
                      <>
                        {item.totalMarks}/{item.maxMarks}{" "}
                        <span className="text-xs text-accent-teal">
                          ({Math.round((item.totalMarks / item.maxMarks) * 100)}%)
                        </span>
                      </>
                    )}
                  </td>
                  <td className="py-3">
                    <Badge tone={gradingBadgeTone(item.gradingStatus)}>{gradingLabel(item.gradingStatus)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
