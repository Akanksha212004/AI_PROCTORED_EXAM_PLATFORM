// "use client";

// // hooks/useProctoringSignals.ts

// import { useCallback, useEffect, useRef, useState } from "react";
// import toast from "react-hot-toast";

// import { proctorEventService } from "@/services/proctorEventService";

// interface Options {
//   sessionId: string;
//   enabled: boolean;
//   fullScreenModeEnabled: boolean;
//   maxTabSwitchWarnings: number;
//   onExceeded: () => void;
// }

// export function useProctoringSignals({
//   sessionId,
//   enabled,
//   fullScreenModeEnabled,
//   maxTabSwitchWarnings,
//   onExceeded,
// }: Options) {
//   const [tabSwitchCount, setTabSwitchCount] = useState(0);
//   // Read the real current state at mount instead of assuming fullscreen —
//   // fixes the exam sometimes starting without the FullScreenGate showing.
//   const [isFullscreen, setIsFullscreen] = useState(() =>
//     typeof document !== "undefined" ? Boolean(document.fullscreenElement) : false
//   );
//   const exceededRef = useRef(false);
//   const tabSwitchCountRef = useRef(0);

//   const requestFullscreen = useCallback(() => {
//     const el = document.documentElement;
//     if (el.requestFullscreen) {
//       el.requestFullscreen().catch(() => undefined);
//     }
//   }, []);

//   useEffect(() => {
//     if (!enabled) return;

//     function handleVisibilityChange() {
//       if (!document.hidden) return;

//       // All side effects live OUTSIDE the state updater now — calling
//       // toast()/onExceeded()/submitEvent() inside a setState updater
//       // was causing them to double-fire or drop, since React can
//       // invoke updater functions more than once.
//       tabSwitchCountRef.current += 1;
//       const next = tabSwitchCountRef.current;
//       setTabSwitchCount(next);

//       proctorEventService
//         .submitEvent(sessionId, { eventType: "TAB_SWITCH", isFlagged: true })
//         .catch(() => undefined);

//       const exceeded = next > maxTabSwitchWarnings;
//       if (exceeded && !exceededRef.current) {
//         exceededRef.current = true;
//         toast.error("Too many tab switches — auto-submitting your exam.");
//         onExceeded();
//       } else if (!exceeded) {
//         toast(`Warning ${next}/${maxTabSwitchWarnings}: leaving the exam tab is flagged.`, { icon: "⚠️" });
//       }
//     }

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [enabled, sessionId, maxTabSwitchWarnings, onExceeded]);

//   useEffect(() => {
//     if (!enabled || !fullScreenModeEnabled) return;

//     requestFullscreen();

//     function handleFullscreenChange() {
//       setIsFullscreen(Boolean(document.fullscreenElement));
//     }

//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
//   }, [enabled, fullScreenModeEnabled, requestFullscreen]);

//   return { tabSwitchCount, isFullscreen, requestFullscreen };
// }





"use client";

// hooks/useProctoringSignals.ts

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

const SUPPRESS_WINDOW_MS = 4000;

export function useProctoringSignals({
  sessionId,
  enabled,
  fullScreenModeEnabled,
  maxTabSwitchWarnings,
  onExceeded,
}: Options) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(() =>
    typeof document !== "undefined" ? Boolean(document.fullscreenElement) : false
  );
  const exceededRef = useRef(false);
  const tabSwitchCountRef = useRef(0);
  const suppressUntilRef = useRef(0);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => undefined);
    }
  }, []);

  // Call this right before intentionally triggering something that opens
  // a native browser dialog (file picker, print, etc.) — those can make
  // the page report as "hidden" even though the student never actually
  // left the exam tab.
  const suppressNextBlur = useCallback(() => {
    suppressUntilRef.current = Date.now() + SUPPRESS_WINDOW_MS;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function handleVisibilityChange() {
      if (!document.hidden) return;

      if (Date.now() < suppressUntilRef.current) {
        // suppressUntilRef.current = 0; // consume it, don't count this hide
        return;
      }

      tabSwitchCountRef.current += 1;
      const next = tabSwitchCountRef.current;
      setTabSwitchCount(next);

      proctorEventService
        .submitEvent(sessionId, { eventType: "TAB_SWITCH", isFlagged: true })
        .catch(() => undefined);

      const exceeded = next > maxTabSwitchWarnings;
      if (exceeded && !exceededRef.current) {
        exceededRef.current = true;
        toast.error("Too many tab switches — auto-submitting your exam.");
        onExceeded();
      } else if (!exceeded) {
        toast(`Warning ${next}/${maxTabSwitchWarnings}: leaving the exam tab is flagged.`, { icon: "⚠️" });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled, sessionId, maxTabSwitchWarnings, onExceeded]);

  useEffect(() => {
    if (!enabled || !fullScreenModeEnabled) return;

    requestFullscreen();

    // function handleFullscreenChange() {
    //   setIsFullscreen(Boolean(document.fullscreenElement));
    // }

    function handleFullscreenChange() {
      const nowFullscreen = Boolean(document.fullscreenElement);
      if (!nowFullscreen && Date.now() < suppressUntilRef.current) {
        // Likely the native file-picker dialog closing fullscreen, not a
        // real exit. Try to silently restore it.
        requestFullscreen();
      }
      setIsFullscreen(nowFullscreen);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [enabled, fullScreenModeEnabled, requestFullscreen]);

  return { tabSwitchCount, isFullscreen, requestFullscreen, suppressNextBlur };
}