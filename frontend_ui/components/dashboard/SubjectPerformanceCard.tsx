"use client";

import { BookOpen } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { SubjectPerformance } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

interface Props {
  data: SubjectPerformance[];
  isLoading: boolean;
}

function barColorClass(score: number | null): string {
  if (score === null) return "bg-paper/15";
  if (score >= 70) return "bg-accent-teal";
  if (score >= 50) return "bg-accent-amber";
  return "bg-accent-rose";
}

export function SubjectPerformanceCard({ data, isLoading }: Props) {
  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <BookOpen className="h-4 w-4 text-accent-violet" />
          Subject Performance
        </p>
        <p className="text-xs text-muted">Average score</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-surface-muted" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No graded submissions yet.</p>
      ) : (
        <div className="space-y-3.5">
          {data.map((subject) => (
            <div key={subject.subject}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="truncate pr-2 text-paper/80">{subject.subject}</span>
                <span className="shrink-0 text-xs text-muted">
                  {subject.averageScore !== null ? `${subject.averageScore}%` : "—"} · {subject.attempts} attempt
                  {subject.attempts === 1 ? "" : "s"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", barColorClass(subject.averageScore))}
                  style={{ width: `${subject.averageScore ?? 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
