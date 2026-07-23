"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ExamComparisonTable } from "@/components/dashboard/ExamComparisonTable";
import { PassFailDonut } from "@/components/dashboard/PassFailDonut";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { SubjectPerformanceCard } from "@/components/dashboard/SubjectPerformanceCard";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function AnalyticsPage() {
  return (
    <RoleGuard allowedRole="EXAMINER">
      <DashboardShell>
        <AnalyticsContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function AnalyticsContent() {
  const { data, isLoading } = useAnalytics(8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">Analytics</h1>
        <p className="mt-1.5 text-sm text-paper/60">
          Based on finalized submissions across your exams, last 8 weeks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <ScoreTrendChart data={data?.scoreTrend ?? []} isLoading={isLoading} />
        <PassFailDonut
          data={data?.passFailRate ?? { passed: 0, failed: 0, total: 0, passRate: null }}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.4fr]">
        <SubjectPerformanceCard data={data?.subjectPerformance ?? []} isLoading={isLoading} />
        <ExamComparisonTable data={data?.examComparison ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
