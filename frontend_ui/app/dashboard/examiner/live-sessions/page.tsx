
"use client";

// app/dashboard/examiner/live-sessions/page.tsx

import { useState } from "react";
import { Radio } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/hooks/useI18n";
import { useLiveSessions } from "@/hooks/useLiveSessions";
import { LiveSessionsTable } from "@/components/live-monitoring/LiveSessionsTable";
import { SessionEventTimeline } from "@/components/live-monitoring/SessionEventTimeline";
import type { LiveSessionItem } from "@/types/proctorEvent";

export default function LiveSessionsPage() {
  return (
    <RoleGuard allowedRole="EXAMINER">
      <DashboardShell>
        <LiveSessionsContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function LiveSessionsContent() {
  const { t } = useI18n();
  const { sessions, isLoading } = useLiveSessions();
  const [viewingSession, setViewingSession] = useState<LiveSessionItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper">{t("admin.liveSessions.title")}</h1>
          <p className="text-sm text-muted">{t("admin.liveSessions.subtitle")}</p>
        </div>
        <span className="flex w-fit items-center gap-1.5 rounded-full border border-accent-teal/30 bg-accent-teal/10 px-3 py-1 text-xs font-medium text-accent-teal sm:ml-auto">
          <Radio className="h-3 w-3 animate-pulse" />
          {t("admin.liveSessions.autoRefreshing")}
        </span>
      </div>

      <Card className="p-5">
        <LiveSessionsTable sessions={sessions} isLoading={isLoading} onViewTimeline={setViewingSession} />
      </Card>

      <SessionEventTimeline session={viewingSession} onClose={() => setViewingSession(null)} />
    </div>
  );
}
