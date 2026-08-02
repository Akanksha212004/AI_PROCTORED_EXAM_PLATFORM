// // components/dashboard/AdminStatsCards.tsx

// import { ClipboardList, Radio, TrendingUp, Users } from "lucide-react";

// import { Card } from "@/components/ui/Card";
// import { cn } from "@/lib/utils";
// import type { AdminDashboardSummary } from "@/types/admin";

// interface Props {
//   summary: AdminDashboardSummary | null;
//   isLoading: boolean;
// }

// type Tone = "sky" | "teal" | "amber" | "violet";

// const ICON_BG: Record<Tone, string> = {
//   sky: "bg-gradient-to-br from-accent-sky/25 to-accent-sky/5 text-accent-sky",
//   teal: "bg-gradient-to-br from-accent-teal/25 to-accent-teal/5 text-accent-teal",
//   amber: "bg-gradient-to-br from-accent-amber/25 to-accent-amber/5 text-accent-amber",
//   violet: "bg-gradient-to-br from-accent-violet/25 to-accent-violet/5 text-accent-violet",
// };

// const HOVER_BORDER: Record<Tone, string> = {
//   sky: "hover:border-accent-sky/50",
//   teal: "hover:border-accent-teal/50",
//   amber: "hover:border-accent-amber/50",
//   violet: "hover:border-accent-violet/50",
// };

// function StatCard({
//   icon,
//   label,
//   value,
//   hint,
//   tone,
//   attention,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: React.ReactNode;
//   hint?: string;
//   tone: Tone;
//   attention?: boolean;
// }) {
//   return (
//     <Card
//       className={cn(
//         "group flex items-start gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sky",
//         HOVER_BORDER[tone]
//       )}
//     >
//       <div className={cn("relative rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105", ICON_BG[tone])}>
//         {icon}
//         {attention && (
//           <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulseDot rounded-full bg-accent-amber ring-2 ring-surface" />
//         )}
//       </div>
//       <div className="min-w-0 flex-1">
//         <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
//         <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-paper">{value}</p>
//         {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
//       </div>
//     </Card>
//   );
// }

// function StatSkeleton() {
//   return (
//     <Card className="flex items-start gap-4 p-5">
//       <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-surface-muted" />
//       <div className="min-w-0 flex-1 space-y-2">
//         <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
//         <div className="h-6 w-14 animate-pulse rounded bg-surface-muted" />
//       </div>
//     </Card>
//   );
// }

// export function AdminStatsCards({ summary, isLoading }: Props) {
//   if (isLoading) {
//     return (
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {[...Array(4)].map((_, i) => (
//           <StatSkeleton key={i} />
//         ))}
//       </div>
//     );
//   }

//   if (!summary) return null;

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//       <StatCard
//         icon={<Users className="h-5 w-5" />}
//         label="Platform Users"
//         value={summary.totalUsers}
//         hint={`${summary.totalStudents} students · ${summary.totalExaminers} examiners · ${summary.totalAdmins} admins`}
//         tone="sky"
//       />
//       <StatCard
//         icon={<ClipboardList className="h-5 w-5" />}
//         label="Total Exams"
//         value={summary.totalExams}
//         hint={`${summary.totalQuestions} questions in bank`}
//         tone="teal"
//       />
//       <StatCard
//         icon={<Radio className="h-5 w-5" />}
//         label="Live Sessions Now"
//         value={summary.liveSessionsNow}
//         hint={summary.pendingGradingCount > 0 ? `${summary.pendingGradingCount} answers awaiting grading` : "All caught up on grading"}
//         tone="amber"
//         attention={summary.liveSessionsNow > 0}
//       />
//       <StatCard
//         icon={<TrendingUp className="h-5 w-5" />}
//         label="Average Score"
//         value={summary.averageScore !== null ? `${summary.averageScore}%` : "—"}
//         hint={summary.averageScore === null ? "No finalized results yet" : "Across all finalized exams"}
//         tone="violet"
//       />
//     </div>
//   );
// }







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
  sky: "bg-gradient-to-br from-accent-sky/25 to-accent-sky/5 text-accent-sky",
  teal: "bg-gradient-to-br from-accent-teal/25 to-accent-teal/5 text-accent-teal",
  amber: "bg-gradient-to-br from-accent-amber/25 to-accent-amber/5 text-accent-amber",
  violet: "bg-gradient-to-br from-accent-violet/25 to-accent-violet/5 text-accent-violet",
};

const HOVER_BORDER: Record<Tone, string> = {
  sky: "hover:border-accent-sky/50",
  teal: "hover:border-accent-teal/50",
  amber: "hover:border-accent-amber/50",
  violet: "hover:border-accent-violet/50",
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
    <Card
      className={cn(
        "group flex items-start gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sky",
        HOVER_BORDER[tone]
      )}
    >
      <div className={cn("relative rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105", ICON_BG[tone])}>
        {icon}
        {attention && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulseDot rounded-full bg-accent-amber ring-2 ring-surface" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-paper">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
    </Card>
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
