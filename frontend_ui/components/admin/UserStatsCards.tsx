// // components/admin/UserStatsCards.tsx

// import { ShieldCheck, UserCheck, Users, UserX } from "lucide-react";

// import { Card } from "@/components/ui/Card";
// import { cn } from "@/lib/utils";
// import type { AdminDashboardSummary } from "@/types/admin";

// interface Props {
//   summary: Pick<AdminDashboardSummary, "totalStudents" | "totalExaminers" | "totalAdmins" | "activeUsers" | "inactiveUsers"> | null;
//   isLoading: boolean;
// }

// type Tone = "sky" | "teal" | "violet" | "rose";

// const ICON_BG: Record<Tone, string> = {
//   sky: "bg-accent-sky/10 text-accent-sky",
//   teal: "bg-accent-teal/10 text-accent-teal",
//   violet: "bg-accent-violet/10 text-accent-violet",
//   rose: "bg-accent-rose/10 text-accent-rose",
// };

// function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone: Tone }) {
//   return (
//     <Card className="flex items-center gap-4 p-5">
//       <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", ICON_BG[tone])}>{icon}</div>
//       <div className="min-w-0 flex-1">
//         <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
//         <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-paper">{value}</p>
//       </div>
//     </Card>
//   );
// }

// export function UserStatsCards({ summary, isLoading }: Props) {
//   if (isLoading || !summary) {
//     return (
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {[...Array(4)].map((_, i) => (
//           <Card key={i} className="h-[84px] animate-pulse p-5" />
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//       <StatCard icon={<Users className="h-5 w-5" />} label="Students" value={summary.totalStudents} tone="sky" />
//       <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Examiners" value={summary.totalExaminers} tone="teal" />
//       <StatCard icon={<UserCheck className="h-5 w-5" />} label="Active Accounts" value={summary.activeUsers} tone="violet" />
//       <StatCard icon={<UserX className="h-5 w-5" />} label="Deactivated" value={summary.inactiveUsers} tone="rose" />
//     </div>
//   );
// }








// components/admin/UserStatsCards.tsx

import { ShieldCheck, UserCheck, Users, UserX } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";
import type { AdminDashboardSummary } from "@/types/admin";

interface Props {
  summary: Pick<AdminDashboardSummary, "totalStudents" | "totalExaminers" | "totalAdmins" | "activeUsers" | "inactiveUsers"> | null;
  isLoading: boolean;
}

type Tone = "sky" | "teal" | "violet" | "rose";

const ICON_BG: Record<Tone, string> = {
  sky: "bg-accent-sky/10 text-accent-sky",
  teal: "bg-accent-teal/10 text-accent-teal",
  violet: "bg-accent-violet/10 text-accent-violet",
  rose: "bg-accent-rose/10 text-accent-rose",
};

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone: Tone }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", ICON_BG[tone])}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-paper">{value}</p>
      </div>
    </Card>
  );
}

export function UserStatsCards({ summary, isLoading }: Props) {
  const { t } = useI18n();

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-[84px] animate-pulse p-5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={<Users className="h-5 w-5" />} label={t("admin.users.stats.students")} value={summary.totalStudents} tone="sky" />
      <StatCard icon={<ShieldCheck className="h-5 w-5" />} label={t("admin.users.stats.examiners")} value={summary.totalExaminers} tone="teal" />
      <StatCard icon={<UserCheck className="h-5 w-5" />} label={t("admin.users.stats.activeAccounts")} value={summary.activeUsers} tone="violet" />
      <StatCard icon={<UserX className="h-5 w-5" />} label={t("admin.users.stats.deactivated")} value={summary.inactiveUsers} tone="rose" />
    </div>
  );
}
