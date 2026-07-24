"use client";

// hooks/useProctoringSignals.ts
//
// Two real proctoring violations are tracked here, sharing one warning
// counter/threshold (the exam only has a single maxTabSwitchWarnings
// config field):
//   1. TAB_SWITCH       — visibilitychange fires with document.hidden = true
//   2. FULLSCREEN_EXIT  — fullscreenchange fires with no fullscreenElement
//
// Both of the above ALSO fire as harmless false positives when the
// student opens the native OS file picker for an image-upload question —
// opening that dialog blurs/hides the page and can force an exit from
// fullscreen, even though the student never left the exam tab on purpose.
//
// suppressNextBlur() arms a ONE-SHOT guard right before we open that
// dialog. It is consumed (reset) by whichever handler sees it first, so it
// can only ever swallow that single expected event — not any real
// violation that happens afterwards, no matter how soon after. (An earlier
// version used a multi-second time window instead of a one-shot guard,
// which could silently swallow real tab switches/fullscreen exits that
// happened to land inside that window too — that's fixed here.)

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

// Safety net only: if neither event fires within this long after
// suppressNextBlur() is armed (e.g. some browser/OS combo where picking a
// file doesn't blur the page at all), auto-disarm it so it can never mask
// a later, real violation indefinitely.
const SUPPRESS_SAFETY_MS = 6000;

export function useProctoringSignals({
  sessionId,
  enabled,
  fullScreenModeEnabled,
  maxTabSwitchWarnings,
  onExceeded,
}: Options) {
  // Combined tab-switch + fullscreen-exit violation count.
  const [violationCount, setViolationCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(() =>
    typeof document !== "undefined" ? Boolean(document.fullscreenElement) : false
  );

  const exceededRef = useRef(false);
  const violationCountRef = useRef(0);
  const suppressGuardRef = useRef(false);
  const suppressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => undefined);
    }
  }, []);

  // Call this right before intentionally opening a native browser dialog
  // (file picker, print, etc.) that could make the page briefly report as
  // hidden / out of fullscreen, even though the student never actually
  // left the exam.
  const suppressNextBlur = useCallback(() => {
    suppressGuardRef.current = true;
    if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current);
    suppressTimeoutRef.current = setTimeout(() => {
      suppressGuardRef.current = false;
    }, SUPPRESS_SAFETY_MS);
  }, []);

  const recordViolation = useCallback(
    (eventType: "TAB_SWITCH" | "FULLSCREEN_EXIT", warningLabel: string) => {
      violationCountRef.current += 1;
      const next = violationCountRef.current;
      setViolationCount(next);

      proctorEventService.submitEvent(sessionId, { eventType, isFlagged: true }).catch(() => undefined);

      const exceeded = next > maxTabSwitchWarnings;
      if (exceeded && !exceededRef.current) {
        exceededRef.current = true;
        toast.error("Too many proctoring violations — auto-submitting your exam.");
        onExceeded();
      } else if (!exceeded) {
        toast(`Warning ${next}/${maxTabSwitchWarnings}: ${warningLabel}.`, { icon: "⚠️" });
      }
    },
    [sessionId, maxTabSwitchWarnings, onExceeded]
  );

  useEffect(() => {
    if (!enabled) return;

    function handleVisibilityChange() {
      if (!document.hidden) return;

      if (suppressGuardRef.current) {
        // Consumed — this is the one expected "hide" from opening the
        // native file picker, not a real tab switch.
        suppressGuardRef.current = false;
        return;
      }

      recordViolation("TAB_SWITCH", "leaving the exam tab is flagged");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled, recordViolation]);

  useEffect(() => {
    if (!enabled || !fullScreenModeEnabled) return;

    requestFullscreen();

    function handleFullscreenChange() {
      const nowFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(nowFullscreen);

      if (nowFullscreen) return;

      if (suppressGuardRef.current) {
        // Consumed — the native file picker forced this exit, not the
        // student. Browsers block requestFullscreen() calls made outside
        // a direct user gesture, so we deliberately don't try to silently
        // re-enter fullscreen from here (that never reliably worked). The
        // caller re-requests fullscreen from the file input's onChange
        // handler instead, which still counts as a trusted user gesture.
        suppressGuardRef.current = false;
        return;
      }

      recordViolation("FULLSCREEN_EXIT", "exiting fullscreen is flagged");
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [enabled, fullScreenModeEnabled, requestFullscreen, recordViolation]);

  useEffect(() => {
    return () => {
      if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current);
    };
  }, []);

  return { tabSwitchCount: violationCount, isFullscreen, requestFullscreen, suppressNextBlur };
}
