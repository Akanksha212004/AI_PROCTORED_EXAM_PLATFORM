// import { BookOpen, ClipboardList, Clock, TrendingUp } from "lucide-react";

// import { Card } from "@/components/ui/Card";
// import type { DashboardSummary } from "@/types/dashboard";

// interface Props {
//   summary: DashboardSummary | null;
//   isLoading: boolean;
// }

// function StatCard({
//   icon,
//   label,
//   value,
//   hint,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: React.ReactNode;
//   hint?: string;
// }) {
//   return (
//     <Card className="flex items-start gap-4 p-5">
//       <div className="rounded-xl bg-accent-sky/15 p-2.5 text-accent-sky">{icon}</div>
//       <div className="min-w-0 flex-1">
//         <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
//         <p className="mt-1 font-display text-2xl font-semibold text-paper">{value}</p>
//         {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
//       </div>
//     </Card>
//   );
// }

// export function ExaminerStatsCards({ summary, isLoading }: Props) {
//   if (isLoading) {
//     return (
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {[...Array(4)].map((_, i) => (
//           <Card key={i} className="h-[92px] animate-pulse p-5" />
//         ))}
//       </div>
//     );
//   }

//   if (!summary) return null;

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//       <StatCard icon={<BookOpen className="h-5 w-5" />} label="Total Questions" value={summary.totalQuestions} />
//       <StatCard icon={<ClipboardList className="h-5 w-5" />} label="Total Exams" value={summary.totalExams} />
//       <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Grading" value={summary.pendingGradingCount} />
//       <StatCard
//         icon={<TrendingUp className="h-5 w-5" />}
//         label="Average Score"
//         value={summary.averageScore !== null ? `${summary.averageScore}%` : "—"}
//         hint={summary.averageScore === null ? "No finalized results yet" : undefined}
//       />
//     </div>
//   );
// }




// import { BookOpen, ClipboardList, Clock, TrendingUp } from "lucide-react";

// import { Card } from "@/components/ui/Card";
// import { cn } from "@/lib/utils";
// import type { DashboardSummary } from "@/types/dashboard";

// interface Props {
//   summary: DashboardSummary | null;
//   isLoading: boolean;
// }

// type Tone = "sky" | "teal" | "amber" | "violet";

// const ICON_BG: Record<Tone, string> = {
//   sky: "bg-accent-sky/15 text-accent-sky",
//   teal: "bg-accent-teal/15 text-accent-teal",
//   amber: "bg-accent-amber/15 text-accent-amber",
//   violet: "bg-accent-violet/15 text-accent-violet",
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
//   /** Shows a small pulse next to the icon — reserved for genuinely urgent values (e.g. pending grading > 0). */
//   attention?: boolean;
// }) {
//   return (
//     <Card className="flex items-start gap-4 p-5 transition-colors hover:border-border-strong">
//       <div className={cn("relative rounded-xl p-2.5", ICON_BG[tone])}>
//         {icon}
//         {attention && (
//           <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulseDot rounded-full bg-accent-amber" />
//         )}
//       </div>
//       <div className="min-w-0 flex-1">
//         <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
//         <p className="mt-1 font-display text-2xl font-semibold text-paper">{value}</p>
//         {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
//       </div>
//     </Card>
//   );
// }

// export function ExaminerStatsCards({ summary, isLoading }: Props) {
//   if (isLoading) {
//     return (
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {[...Array(4)].map((_, i) => (
//           <Card key={i} className="h-[92px] animate-pulse p-5" />
//         ))}
//       </div>
//     );
//   }

//   if (!summary) return null;

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//       <StatCard
//         icon={<BookOpen className="h-5 w-5" />}
//         label="Total Questions"
//         value={summary.totalQuestions}
//         tone="sky"
//       />
//       <StatCard
//         icon={<ClipboardList className="h-5 w-5" />}
//         label="Total Exams"
//         value={summary.totalExams}
//         tone="teal"
//       />
//       <StatCard
//         icon={<Clock className="h-5 w-5" />}
//         label="Pending Grading"
//         value={summary.pendingGradingCount}
//         hint={summary.pendingGradingCount > 0 ? "Needs your review" : "All caught up"}
//         tone="amber"
//         attention={summary.pendingGradingCount > 0}
//       />
//       <StatCard
//         icon={<TrendingUp className="h-5 w-5" />}
//         label="Average Score"
//         value={summary.averageScore !== null ? `${summary.averageScore}%` : "—"}
//         hint={summary.averageScore === null ? "No finalized results yet" : undefined}
//         tone="violet"
//       />
//     </div>
//   );
// }




import { BookOpen, ClipboardList, Clock, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

interface Props {
  summary: DashboardSummary | null;
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
  /** Small pulse next to the icon — reserved for genuinely urgent values (e.g. pending grading > 0). */
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

export function ExaminerStatsCards({ summary, isLoading }: Props) {
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
        label="Total Questions"
        value={summary.totalQuestions}
        tone="sky"
      />
      <StatCard
        icon={<ClipboardList className="h-5 w-5" />}
        label="Total Exams"
        value={summary.totalExams}
        tone="teal"
      />
      <StatCard
        icon={<Clock className="h-5 w-5" />}
        label="Pending Grading"
        value={summary.pendingGradingCount}
        hint={summary.pendingGradingCount > 0 ? "Needs your review" : "All caught up"}
        tone="amber"
        attention={summary.pendingGradingCount > 0}
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Average Score"
        value={summary.averageScore !== null ? `${summary.averageScore}%` : "—"}
        hint={summary.averageScore === null ? "No finalized results yet" : undefined}
        tone="violet"
      />
    </div>
  );
}
