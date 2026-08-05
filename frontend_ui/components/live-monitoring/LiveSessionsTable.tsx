"use client";

import { AlertTriangle, Eye } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/hooks/useI18n";
import type { LiveSessionItem } from "@/types/proctorEvent";

interface Props {
  sessions: LiveSessionItem[];
  isLoading: boolean;
  onViewTimeline: (session: LiveSessionItem) => void;
}

export function LiveSessionsTable({ sessions, isLoading, onViewTimeline }: Props) {
  const { t } = useI18n();

  function elapsedTime(startTime: string): string {
    const minutes = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
    return `${minutes} ${t("liveMonitoring.table.minutesSuffix")}`;
  }

  if (isLoading && sessions.length === 0) {
    return <p className="py-16 text-center text-sm text-muted">{t("liveMonitoring.loading")}</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <p className="font-display text-lg text-paper">{t("liveMonitoring.emptyTitle")}</p>
        <p className="max-w-sm text-sm text-muted">{t("liveMonitoring.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm sm:min-w-[800px]">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="py-3 pr-4 font-medium">{t("liveMonitoring.table.student")}</th>
            <th className="py-3 pr-4 font-medium">{t("liveMonitoring.table.exam")}</th>
            <th className="hidden py-3 pr-4 font-medium sm:table-cell">{t("liveMonitoring.table.elapsed")}</th>
            <th className="hidden py-3 pr-4 font-medium md:table-cell">{t("liveMonitoring.table.tabSwitches")}</th>
            <th className="py-3 pr-4 font-medium">{t("liveMonitoring.table.flags")}</th>
            <th className="py-3 pr-2 text-right font-medium">{t("liveMonitoring.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.sessionId} className="border-b border-border/60 hover:bg-white/[0.03]">
              <td className="max-w-[160px] py-3.5 pr-4">
                <p className="truncate text-paper">{s.studentName}</p>
                <p className="truncate text-xs text-muted" title={s.studentEmail}>{s.studentEmail}</p>
              </td>
              <td className="max-w-[180px] py-3.5 pr-4 text-paper">
                <span className="block truncate">{s.examTitle}</span>
                <span className="mt-0.5 block text-xs text-muted sm:hidden">{elapsedTime(s.startTime)}</span>
              </td>
              <td className="hidden py-3.5 pr-4 text-muted sm:table-cell">{elapsedTime(s.startTime)}</td>
              <td className="hidden py-3.5 pr-4 text-muted md:table-cell">
                {s.tabSwitchWarnings} / {s.maxTabSwitchWarnings}
              </td>
              <td className="py-3.5 pr-4">
                {s.flaggedEventCount > 0 ? (
                  <Badge tone="rose">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {s.flaggedEventCount} {t("liveMonitoring.table.flaggedSuffix")}
                  </Badge>
                ) : (
                  <Badge tone="teal">{t("liveMonitoring.table.clean")}</Badge>
                )}
              </td>
              <td className="py-3.5 pr-2 text-right">
                <button
                  onClick={() => onViewTimeline(s)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-accent-sky hover:bg-white/5"
                >
                  <Eye className="h-3.5 w-3.5" /> {t("liveMonitoring.table.view")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
