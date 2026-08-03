"use client";

import { CalendarClock, ClipboardList, PlayCircle, Layers } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/hooks/useI18n";
import type { ExamStats } from "@/hooks/useExamStats";

interface Props {
  stats: ExamStats | null;
  isLoading: boolean;
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <div className="rounded-xl bg-accent-sky/15 p-2.5 text-accent-sky">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-paper">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
    </Card>
  );
}

export function ExamStatsCards({ stats, isLoading }: Props) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-[92px] animate-pulse p-5" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<ClipboardList className="h-5 w-5" />}
        label={t("exams.stats.totalExams")}
        value={stats.totalExams}
      />
      <StatCard
        icon={<CalendarClock className="h-5 w-5" />}
        label={t("exams.stats.upcoming")}
        value={stats.upcomingCount}
      />
      <StatCard
        icon={<PlayCircle className="h-5 w-5" />}
        label={t("exams.stats.activeNow")}
        value={stats.activeNowCount}
      />
      <StatCard
        icon={<Layers className="h-5 w-5" />}
        label={t("exams.stats.subjects")}
        value={stats.subjects.length}
        hint={stats.isSampled ? t("exams.stats.subjectsHint") : undefined}
      />
    </div>
  );
}
