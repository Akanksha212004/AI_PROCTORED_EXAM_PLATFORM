"use client";

// components/exam-taking/ProctoringMicWidget.tsx

import { AlertTriangle, Mic, MicOff } from "lucide-react";
import { useState } from "react";
import type { MonitoringStatus } from "@/hooks/useAudioMonitoring";
import { cn } from "@/lib/utils";

interface Props {
  status: MonitoringStatus;
  level: number; // 0–1
  isSpeaking: boolean;
}

export function ProctoringMicWidget({ status, level, isSpeaking }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const hasWarning = status === "active" && isSpeaking;

  // A handful of discrete bars driven by the live RMS level — a simple,
  // honest meter (not claiming to detect speech vs. noise vs. music).
  const barCount = 12;
  const litBars = Math.round(Math.min(1, level / 0.3) * barCount);

  return (
    <div className="w-44 overflow-visible rounded-xl border border-border bg-surface shadow-card">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {status === "denied" || status === "error" ? (
          <MicOff className="h-3.5 w-3.5 shrink-0 text-accent-rose" />
        ) : (
          <Mic className={cn("h-3.5 w-3.5 shrink-0", status === "active" ? "text-accent-teal" : "text-muted")} />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">
            {status === "active" && "Mic monitoring active"}
            {status === "loading" && "Starting mic..."}
            {status === "denied" && "Mic permission denied"}
            {status === "error" && "Mic unavailable"}
            {status === "idle" && "Mic off"}
          </p>
          {status === "active" && (
            <div className="mt-1.5 flex h-2 items-end gap-[2px]" aria-hidden="true">
              {Array.from({ length: barCount }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-full w-full rounded-[1px] transition-colors duration-100",
                    i < litBars ? (i > barCount - 3 ? "bg-accent-rose" : "bg-accent-teal") : "bg-surface-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {hasWarning && (
        <button
          onClick={() => setShowDetail((v) => !v)}
          className="flex w-full items-center gap-1.5 border-t border-accent-amber/30 bg-accent-amber/90 px-2.5 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-accent-amber"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Sustained audio detected
        </button>
      )}

      {hasWarning && showDetail && (
        <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-accent-amber/30 bg-surface p-3 text-xs text-paper/85 shadow-lg">
          Ongoing talking or background noise picked up on your mic. Keep your surroundings quiet during the exam.
        </div>
      )}
    </div>
  );
}
