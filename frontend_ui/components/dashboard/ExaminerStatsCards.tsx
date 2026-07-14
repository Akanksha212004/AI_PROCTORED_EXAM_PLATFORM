import { BookOpen, ClipboardList, Clock, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { DashboardSummary } from "@/types/dashboard";

interface Props {
  summary: DashboardSummary | null;
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

export function ExaminerStatsCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-[92px] animate-pulse p-5" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={<BookOpen className="h-5 w-5" />} label="Total Questions" value={summary.totalQuestions} />
      <StatCard icon={<ClipboardList className="h-5 w-5" />} label="Total Exams" value={summary.totalExams} />
      <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Grading" value={summary.pendingGradingCount} />
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Average Score"
        value={summary.averageScore !== null ? `${summary.averageScore}%` : "—"}
        hint={summary.averageScore === null ? "No finalized results yet" : undefined}
      />
    </div>
  );
}
