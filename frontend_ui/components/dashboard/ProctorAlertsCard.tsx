import { ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/Card";

/**
 * Placeholder panel for live proctoring alerts.
 *
 * The `ProctorEvent` model already exists in the Prisma schema, but there's
 * currently no dashboard-facing endpoint/hook that surfaces flagged events
 * (multi-face, tab-switch, camera-lost, etc.) in real time. Rather than
 * fabricate sample alerts, this panel stays as an honest empty state until
 * that endpoint exists — swap the body below for a live feed once
 * `dashboardService` (or a dedicated `useProctorAlerts` hook) exposes one.
 */
export function ProctorAlertsCard() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <ShieldAlert className="h-4 w-4 text-accent-rose" />
          Proctor Alerts
        </p>
        <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
          Not connected
        </span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
        <ShieldAlert className="mb-2 h-6 w-6 text-muted" />
        <p className="text-sm text-paper/80">No live proctoring feed yet</p>
        <p className="mt-1 max-w-[220px] text-xs text-muted">
          Connect a proctor-events endpoint to surface flagged sessions here in real time.
        </p>
      </div>
    </Card>
  );
}
