"use client";

// hooks/useProctoringSignals.ts
//
// Tab-switch / window-blur and Fullscreen API monitoring, using only
// native browser APIs. Tab-switch events are now PERSISTED as
// ProctorEvent rows (via proctorEventService) — this is the piece that
// was previously client-side-only and is now wired to the real backend.

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { proctorEventService } from "@/services/proctorEventService";

interface Options {
  sessionId: string;
  enabled: boolean;
  fullScreenModeEnabled: boolean;
  maxTabSwitchWarnings: number;
  onExceeded: () => void;
}

export function useProctoringSignals({
  sessionId,
  enabled,
  fullScreenModeEnabled,
  maxTabSwitchWarnings,
  onExceeded,
}: Options) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const exceededRef = useRef(false);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function handleVisibilityChange() {
      if (document.hidden) {
        setTabSwitchCount((c) => {
          const next = c + 1;
          const exceeded = next > maxTabSwitchWarnings;

          proctorEventService
            .submitEvent(sessionId, { eventType: "TAB_SWITCH", isFlagged: true })
            .catch(() => undefined);

          if (exceeded && !exceededRef.current) {
            exceededRef.current = true;
            toast.error("Too many tab switches — auto-submitting your exam.");
            onExceeded();
          } else if (!exceeded) {
            toast(`Warning ${next}/${maxTabSwitchWarnings}: leaving the exam tab is flagged.`, { icon: "⚠️" });
          }
          return next;
        });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled, sessionId, maxTabSwitchWarnings, onExceeded]);

  useEffect(() => {
    if (!enabled || !fullScreenModeEnabled) return;

    requestFullscreen();

    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [enabled, fullScreenModeEnabled, requestFullscreen]);

  return { tabSwitchCount, isFullscreen, requestFullscreen };
}
