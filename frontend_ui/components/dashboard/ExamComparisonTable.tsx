"use client";

import { ListOrdered } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { ExamComparisonRow } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

interface Props {
  data: ExamComparisonRow[];
  isLoading: boolean;
}

function scoreColorClass(score: number | null): string {
  if (score === null) return "bg-paper/15";
  if (score >= 70) return "bg-accent-teal";
  if (score >= 50) return "bg-accent-amber";
  return "bg-accent-rose";
}

export function ExamComparisonTable({ data, isLoading }: Props) {
  return (
    <Card interactive className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <ListOrdered className="h-4 w-4 text-accent-amber" />
          Exam Comparison
        </p>
        <p className="text-xs text-muted">By attempts</p>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted">No graded submissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Exam</th>
                <th className="px-5 py-3 font-medium">Attempts</th>
                <th className="px-5 py-3 font-medium">Average Score</th>
                <th className="px-5 py-3 font-medium">Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((exam) => (
                <tr key={exam.examId} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-paper">{exam.examTitle}</p>
                    <p className="text-xs text-muted">{exam.subject}</p>
                  </td>
                  <td className="px-5 py-3.5 text-paper/80">{exam.attempts}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className={cn("h-full rounded-full", scoreColorClass(exam.averageScore))}
                          style={{ width: `${exam.averageScore ?? 0}%` }}
                        />
                      </div>
                      <span className="text-paper/80">{exam.averageScore !== null ? `${exam.averageScore}%` : "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-paper/80">{exam.passRate !== null ? `${exam.passRate}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
