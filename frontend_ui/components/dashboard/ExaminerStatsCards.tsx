import { BookOpen, ClipboardList, Clock, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";
import type { DashboardSummary } from "@/types/dashboard";

interface Props {
  summary: DashboardSummary | null;
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

/** Rich gradient card backgrounds for the four top-line stat cards — bolder than the
 * subtle card-surface gradient used everywhere else, since these are the dashboard's
 * headline numbers and are meant to stand out. */
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
  /** Small pulse next to the icon — reserved for genuinely urgent values (e.g. pending grading > 0). */
  attention?: boolean;
}) {
  return (
    <div
      className={cn(
        // Built directly (not via <Card>) so this is the only background-image class
        // on the element — Card's own bg-card-surface would otherwise sit alongside
        // this tone gradient with no guaranteed winner between the two.
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

export function ExaminerStatsCards({ summary, isLoading }: Props) {
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
        icon={<BookOpen className="h-5 w-5" />}
        label={t("dashboard.examiner.stats.totalQuestions")}
        value={summary.totalQuestions}
        tone="sky"
      />
      <StatCard
        icon={<ClipboardList className="h-5 w-5" />}
        label={t("dashboard.examiner.stats.totalExams")}
        value={summary.totalExams}
        tone="teal"
      />
      <StatCard
        icon={<Clock className="h-5 w-5" />}
        label={t("dashboard.examiner.stats.pendingGrading")}
        value={summary.pendingGradingCount}
        hint={
          summary.pendingGradingCount > 0
            ? t("dashboard.examiner.stats.needsReview")
            : t("dashboard.examiner.stats.allCaughtUp")
        }
        tone="amber"
        attention={summary.pendingGradingCount > 0}
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label={t("dashboard.examiner.stats.averageScore")}
        value={summary.averageScore !== null ? `${summary.averageScore}%` : "—"}
        hint={summary.averageScore === null ? t("dashboard.examiner.stats.noFinalizedResults") : undefined}
        tone="violet"
      />
    </div>
  );
}
