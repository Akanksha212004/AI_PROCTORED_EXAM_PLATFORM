"use client";

import { AlertTriangle, Eye } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { LiveSessionItem } from "@/types/proctorEvent";

interface Props {
  sessions: LiveSessionItem[];
  isLoading: boolean;
  onViewTimeline: (session: LiveSessionItem) => void;
}

function elapsedTime(startTime: string): string {
  const minutes = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
  return `${minutes} min`;
}

export function LiveSessionsTable({ sessions, isLoading, onViewTimeline }: Props) {
  if (isLoading && sessions.length === 0) {
    return <p className="py-16 text-center text-sm text-muted">Loading live sessions...</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="font-display text-lg text-paper">No one is taking an exam right now</p>
        <p className="max-w-sm text-sm text-muted">
          This page auto-refreshes every 10 seconds — it&apos;ll populate as soon as a student starts an exam.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="py-3 pr-4 font-medium">Student</th>
            <th className="py-3 pr-4 font-medium">Exam</th>
            <th className="py-3 pr-4 font-medium">Elapsed</th>
            <th className="py-3 pr-4 font-medium">Tab Switches</th>
            <th className="py-3 pr-4 font-medium">Flags</th>
            <th className="py-3 pr-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.sessionId} className="border-b border-border/60 hover:bg-white/[0.03]">
              <td className="py-3.5 pr-4">
                <p className="text-paper">{s.studentName}</p>
                <p className="text-xs text-muted">{s.studentEmail}</p>
              </td>
              <td className="py-3.5 pr-4 text-paper">{s.examTitle}</td>
              <td className="py-3.5 pr-4 text-muted">{elapsedTime(s.startTime)}</td>
              <td className="py-3.5 pr-4 text-muted">
                {s.tabSwitchWarnings} / {s.maxTabSwitchWarnings}
              </td>
              <td className="py-3.5 pr-4">
                {s.flaggedEventCount > 0 ? (
                  <Badge tone="rose">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {s.flaggedEventCount} flagged
                  </Badge>
                ) : (
                  <Badge tone="teal">Clean</Badge>
                )}
              </td>
              <td className="py-3.5 pr-2 text-right">
                <button
                  onClick={() => onViewTimeline(s)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-accent-sky hover:bg-white/5"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
