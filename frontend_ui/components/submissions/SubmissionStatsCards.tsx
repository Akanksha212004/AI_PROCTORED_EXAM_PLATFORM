import { ClipboardCheck, Clock, FileCheck2 } from "lucide-react";

import { Card } from "@/components/ui/Card";

interface Props {
  totalSubmissions: number;
  pendingCount: number;
  gradedCount: number;
  isLoading: boolean;
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <div className="rounded-xl bg-accent-sky/15 p-2.5 text-accent-sky">{icon}</div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-paper">{value}</p>
      </div>
    </Card>
  );
}

export function SubmissionStatsCards({ totalSubmissions, pendingCount, gradedCount, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-[92px] animate-pulse p-5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard icon={<ClipboardCheck className="h-5 w-5" />} label="Total Submissions" value={totalSubmissions} />
      <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Grading" value={pendingCount} />
      <StatCard icon={<FileCheck2 className="h-5 w-5" />} label="Fully Graded" value={gradedCount} />
    </div>
  );
}
