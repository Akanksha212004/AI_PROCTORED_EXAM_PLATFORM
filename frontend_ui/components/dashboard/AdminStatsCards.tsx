// components/dashboard/AdminStatsCards.tsx

import { ClipboardList, Radio, TrendingUp, Users } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";
import type { AdminDashboardSummary } from "@/types/admin";

interface Props {
  summary: AdminDashboardSummary | null;
  isLoading: boolean;
}

type Tone = "sky" | "teal" | "amber" | "violet";

const ICON_BG: Record<Tone, string> = {
  sky: "bg-tone-sky text-white shadow-sm shadow-accent-sky/25",
  teal: "bg-tone-teal text-white shadow-sm shadow-accent-teal/25",
  amber: "bg-tone-amber text-white shadow-sm shadow-accent-amber/25",
  violet: "bg-tone-violet text-white shadow-sm shadow-accent-violet/25",
};

const HOVER_BORDER: Record<Tone, string> = {
  sky: "hover:border-accent-sky/50",
  teal: "hover:border-accent-teal/50",
  amber: "hover:border-accent-amber/50",
  violet: "hover:border-accent-violet/50",
};

/** Rich gradient card backgrounds for the four top-line stat cards. */
const CARD_BG: Record<Tone, string> = {
  sky: "bg-gradient-to-br from-[#26418F] via-[#152A5C] to-[#0B2135] border-accent-sky/25",
  teal: "bg-gradient-to-br from-[#0E5478] via-[#0C3550] to-[#0B2135] border-accent-teal/25",
  amber: "bg-gradient-to-br from-[#7A3A0F] via-[#4A2410] to-[#0B2135] border-accent-amber/25",
  violet: "bg-gradient-to-br from-[#4A2E86] via-[#2C1C52] to-[#0B2135] border-accent-violet/25",
};

function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
  attention,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone: Tone;
  attention?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-2xl border p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sky",
        CARD_BG[tone],
        HOVER_BORDER[tone]
      )}
    >
      <div className={cn("relative rounded-xl p-2.5 shadow-md transition-transform duration-200 group-hover:scale-105", ICON_BG[tone])}>
        {icon}
        {attention && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulseDot rounded-full bg-accent-amber ring-2 ring-surface" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-paper/70">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-paper">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-paper/60">{hint}</p>}
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <Card className="flex items-start gap-4 p-5">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-surface-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
        <div className="h-6 w-14 animate-pulse rounded bg-surface-muted" />
      </div>
    </Card>
  );
}

export function AdminStatsCards({ summary, isLoading }: Props) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Users className="h-5 w-5" />}
        label={t("admin.stats.platformUsers")}
        value={summary.totalUsers}
        hint={t("admin.stats.platformUsersHint", {
          students: summary.totalStudents,
          examiners: summary.totalExaminers,
          admins: summary.totalAdmins,
        })}
        tone="sky"
      />
      <StatCard
        icon={<ClipboardList className="h-5 w-5" />}
        label={t("admin.stats.totalExams")}
        value={summary.totalExams}
        hint={t("admin.stats.totalExamsHint", { count: summary.totalQuestions })}
        tone="teal"
      />
      <StatCard
        icon={<Radio className="h-5 w-5" />}
        label={t("admin.stats.liveSessionsNow")}
        value={summary.liveSessionsNow}
        hint={
          summary.pendingGradingCount > 0
            ? t("admin.stats.liveSessionsHintPending", { count: summary.pendingGradingCount })
            : t("admin.stats.liveSessionsHintCaughtUp")
        }
        tone="amber"
        attention={summary.liveSessionsNow > 0}
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label={t("admin.stats.averageScore")}
        value={summary.averageScore !== null ? `${summary.averageScore}%` : "—"}
        hint={summary.averageScore === null ? t("admin.stats.averageScoreHintEmpty") : t("admin.stats.averageScoreHint")}
        tone="violet"
      />
    </div>
  );
}
