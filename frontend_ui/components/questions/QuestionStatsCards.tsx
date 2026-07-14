"use client";

import { BookOpen, Layers, ListChecks, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge, difficultyTone } from "@/components/ui/Badge";
import type { QuestionStats } from "@/hooks/useQuestionStats";

interface Props {
  stats: QuestionStats | null;
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

export function QuestionStatsCards({ stats, isLoading }: Props) {
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Total Questions"
          value={stats.totalQuestions}
        />
        <StatCard
          icon={<Layers className="h-5 w-5" />}
          label="Subjects"
          value={stats.subjectCount}
          hint={stats.isSampled ? "from most recent 100" : undefined}
        />
        <StatCard
          icon={<ListChecks className="h-5 w-5" />}
          label="Difficulty Mix"
          value={
            <div className="mt-1 flex gap-1.5">
              <Badge tone={difficultyTone("EASY")}>{stats.difficultyDistribution.EASY} Easy</Badge>
              <Badge tone={difficultyTone("MEDIUM")}>{stats.difficultyDistribution.MEDIUM} Med</Badge>
              <Badge tone={difficultyTone("HARD")}>{stats.difficultyDistribution.HARD} Hard</Badge>
            </div>
          }
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="Recently Added"
          value={stats.recentQuestions.length}
          hint={stats.recentQuestions[0]?.subject ?? undefined}
        />
      </div>
    </div>
  );
}
