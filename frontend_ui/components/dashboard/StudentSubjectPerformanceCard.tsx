"use client";

// components/dashboard/StudentSubjectPerformanceCard.tsx
//
// Full-width subject breakdown, deliberately separated from PerformanceOverviewCard.
// Keeping it full-width (instead of squeezed into the narrow sidebar column) means a
// long subject list just grows downward in its own row instead of forcing the score
// ring card next to it to stretch — which was the root cause of the mismatched/empty
// space between "Today's Exams" and "Performance Overview".

import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";
import type { StudentSubjectPerformance } from "@/hooks/useStudentDashboard";

import { useAutoTranslate } from "@/hooks/useAutoTranslate";

function LocalizedText({ text }: { text: string }) {
  const translated = useAutoTranslate(text);
  return <>{translated}</>;
}

interface Props {
  data: StudentSubjectPerformance[];
  isLoading: boolean;
}

const SUBJECT_COLOR_PALETTE = [
  "bg-gradient-to-r from-accent-teal to-accent-sky",
  "bg-gradient-to-r from-accent-sky to-accent-violet",
  "bg-gradient-to-r from-accent-violet to-accent-rose",
  "bg-gradient-to-r from-accent-amber to-[#F97316]",
  "bg-gradient-to-r from-accent-rose to-[#EC4899]",
];

function barColorClass(index: number, score: number | null): string {
  if (score === null) return "bg-paper/15";
  return SUBJECT_COLOR_PALETTE[index % SUBJECT_COLOR_PALETTE.length];
}

export function StudentSubjectPerformanceCard({ data, isLoading }: Props) {
  const { t } = useI18n();

  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <BarChart3 className="h-4 w-4 text-accent-violet" />
          {t("dashboard.student.subjectPerformance.title")}
        </p>
        <Link href="/dashboard/student/analytics" className="text-xs font-medium text-accent-sky hover:text-accent-sky/80">
          {t("dashboard.student.subjectPerformance.viewDetailedAnalytics")}
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-surface-muted" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{t("dashboard.student.subjectPerformance.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
          {data.map((subject, index) => (
            <div key={subject.subject} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 truncate text-paper/80 sm:w-36">
                <LocalizedText text={subject.subject} />
              </span>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    barColorClass(index, subject.averageScore)
                  )}
                  style={{ width: `${subject.averageScore ?? 0}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-muted">
                {subject.averageScore !== null ? `${subject.averageScore}%` : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
