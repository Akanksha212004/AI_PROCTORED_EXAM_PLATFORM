"use client";

import { BookOpen } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { SubjectPerformance } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

import { useAutoTranslate } from "@/hooks/useAutoTranslate";

import { useI18n } from "@/hooks/useI18n";
interface Props {
  data: SubjectPerformance[];
  isLoading: boolean;
}

function barColorClass(score: number | null): string {
  if (score === null) return "bg-paper/15";
  if (score >= 70) return "bg-gradient-to-r from-accent-teal to-accent-sky";
  if (score >= 50) return "bg-gradient-to-r from-accent-amber to-[#F97316]";
  return "bg-gradient-to-r from-accent-rose to-[#EC4899]";
}

function LocalizedText({ text }: { text: string }) {
  const translated = useAutoTranslate(text);
  return <>{translated}</>;
}

function LocalizedSubjectName({ name }: { name: string }) {
  const translatedName = useAutoTranslate(name);
  return <span>{translatedName}</span>;
}

export function SubjectPerformanceCard({ data, isLoading }: Props) {
  const { t } = useI18n();
  
  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <BookOpen className="h-4 w-4 text-accent-violet" />
          {t("analytics.subjectPerformance")}
        </p>
        <p className="text-xs text-muted">{t("analytics.averageScore")}</p>
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
                {/* <span className="truncate pr-2 text-paper/80">{subject.subject}</span> */}
                
                <span className="truncate pr-2 text-paper/80">
                  <LocalizedText text={subject.subject} />
                </span>

                <span className="shrink-0 text-xs text-muted">
                  {subject.averageScore !== null ? `${subject.averageScore}%` : "—"} · {" "}
                  {subject.attempts} {t("analytics.attempts")}
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
