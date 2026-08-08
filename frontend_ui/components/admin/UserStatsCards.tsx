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
  sky: "bg-tone-sky text-white shadow-sm shadow-accent-sky/25",
  teal: "bg-tone-teal text-white shadow-sm shadow-accent-teal/25",
  violet: "bg-tone-violet text-white shadow-sm shadow-accent-violet/25",
  rose: "bg-tone-rose text-white shadow-sm shadow-accent-rose/25",
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
