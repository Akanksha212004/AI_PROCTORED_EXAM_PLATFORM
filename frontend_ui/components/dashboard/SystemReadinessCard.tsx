"use client";

// components/dashboard/SystemReadinessCard.tsx
//
// A lightweight, client-only readiness checklist for the student dashboard.
// It never forces a camera/mic permission prompt on page load — it only
// reads permission state via the Permissions API where available, and
// actively probes devices only when the student clicks "Run system check
// again". There is no backend endpoint for this yet (readiness is only
// reported inside an active exam session), so everything here is derived
// straight from the browser.

import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

type ReadinessState = "checking" | "ready" | "warning" | "unavailable";

interface ReadinessRow {
  labelKey: string;
  state: ReadinessState;
  detailKey: string;
}

const STATE_DOT: Record<ReadinessState, string> = {
  ready: "bg-accent-teal",
  warning: "bg-accent-amber",
  unavailable: "bg-accent-rose",
  checking: "bg-paper/30",
};

const STATE_TEXT: Record<ReadinessState, string> = {
  ready: "text-accent-teal",
  warning: "text-accent-amber",
  unavailable: "text-accent-rose",
  checking: "text-paper/40",
};

async function checkPermission(name: "camera" | "microphone"): Promise<ReadinessState> {
  try {
    if (!navigator.permissions?.query) return "warning";
    // TS's lib.dom permission name union doesn't include camera/microphone in every version —
    // cast keeps this resilient across TS/lib versions without pulling in extra types.
    const status = await navigator.permissions.query({ name: name as PermissionName });
    if (status.state === "granted") return "ready";
    if (status.state === "denied") return "unavailable";
    return "warning"; // "prompt" — not yet decided
  } catch {
    return "warning";
  }
}

/**
 * Actively requests camera/mic access via getUserMedia — this is what actually
 * triggers the browser's permission prompt (a passive Permissions-API query never
 * does). Only called when the student explicitly clicks "Run system check again",
 * never on page load. Stops the track immediately after the grant/deny resolves —
 * we only need the permission decision, not a live stream.
 */
async function requestPermission(kind: "camera" | "microphone"): Promise<ReadinessState> {
  if (!navigator.mediaDevices?.getUserMedia) return "unavailable";
  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      kind === "camera" ? { video: true } : { audio: true }
    );
    stream.getTracks().forEach((track) => track.stop());
    return "ready";
  } catch (err) {
    if (err instanceof DOMException && (err.name === "NotFoundError" || err.name === "DevicesNotFoundError")) {
      return "unavailable";
    }
    return "unavailable"; // permission denied, or dismissed
  }
}

function checkConnection(): ReadinessRow {
  const labelKey = "dashboard.student.systemReadiness.rows.internetConnection";
  if (typeof navigator === "undefined")
    return { labelKey, state: "checking", detailKey: "dashboard.student.systemReadiness.detail.checking" };
  if (!navigator.onLine)
    return { labelKey, state: "unavailable", detailKey: "dashboard.student.systemReadiness.detail.offline" };
  const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
  const effectiveType = conn?.effectiveType;
  if (effectiveType && ["slow-2g", "2g"].includes(effectiveType)) {
    return { labelKey, state: "warning", detailKey: "dashboard.student.systemReadiness.detail.slowConnection" };
  }
  return { labelKey, state: "ready", detailKey: "dashboard.student.systemReadiness.detail.stable" };
}

function checkBrowser(): ReadinessRow {
  const supported =
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof RTCPeerConnection !== "undefined";
  return {
    labelKey: "dashboard.student.systemReadiness.rows.browser",
    state: supported ? "ready" : "unavailable",
    detailKey: supported
      ? "dashboard.student.systemReadiness.detail.supported"
      : "dashboard.student.systemReadiness.detail.unsupported",
  };
}

function checkFullscreen(): ReadinessRow {
  const supported = typeof document !== "undefined" && document.fullscreenEnabled;
  return {
    labelKey: "dashboard.student.systemReadiness.rows.fullscreen",
    state: supported ? "ready" : "warning",
    detailKey: supported
      ? "dashboard.student.systemReadiness.detail.ready"
      : "dashboard.student.systemReadiness.detail.restricted",
  };
}

export function SystemReadinessCard() {
  const { t } = useI18n();
  const [rows, setRows] = useState<ReadinessRow[]>([
    { labelKey: "dashboard.student.systemReadiness.rows.camera", state: "checking", detailKey: "dashboard.student.systemReadiness.detail.checking" },
    { labelKey: "dashboard.student.systemReadiness.rows.microphone", state: "checking", detailKey: "dashboard.student.systemReadiness.detail.checking" },
    { labelKey: "dashboard.student.systemReadiness.rows.internetConnection", state: "checking", detailKey: "dashboard.student.systemReadiness.detail.checking" },
    { labelKey: "dashboard.student.systemReadiness.rows.browser", state: "checking", detailKey: "dashboard.student.systemReadiness.detail.checking" },
    { labelKey: "dashboard.student.systemReadiness.rows.fullscreen", state: "checking", detailKey: "dashboard.student.systemReadiness.detail.checking" },
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const detailKeyFor = (state: ReadinessState) =>
    state === "ready"
      ? "dashboard.student.systemReadiness.detail.ready"
      : state === "warning"
      ? "dashboard.student.systemReadiness.detail.needsPermission"
      : "dashboard.student.systemReadiness.detail.blocked";

  /** Runs on mount — reads current permission state only, never prompts. */
  const runPassiveCheck = useCallback(async () => {
    const [camera, microphone] = await Promise.all([checkPermission("camera"), checkPermission("microphone")]);
    setRows([
      { labelKey: "dashboard.student.systemReadiness.rows.camera", state: camera, detailKey: detailKeyFor(camera) },
      { labelKey: "dashboard.student.systemReadiness.rows.microphone", state: microphone, detailKey: detailKeyFor(microphone) },
      checkConnection(),
      checkBrowser(),
      checkFullscreen(),
    ]);
  }, []);

  /** Runs on "Run system check again" — actively requests camera/mic access, which is what actually resolves a stuck "Needs permission" state. */
  const runActiveCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const [camera, microphone] = await Promise.all([
        requestPermission("camera"),
        requestPermission("microphone"),
      ]);
      setRows([
        { labelKey: "dashboard.student.systemReadiness.rows.camera", state: camera, detailKey: detailKeyFor(camera) },
        { labelKey: "dashboard.student.systemReadiness.rows.microphone", state: microphone, detailKey: detailKeyFor(microphone) },
        checkConnection(),
        checkBrowser(),
        checkFullscreen(),
      ]);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    runPassiveCheck();
  }, [runPassiveCheck]);

  return (
    <Card interactive className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <ShieldCheck className="h-4 w-4 text-accent-teal" />
          {t("dashboard.student.systemReadiness.title")}
        </p>
      </div>

      <ul className="flex-1 space-y-3.5">
        {rows.map((row) => (
          <li key={row.labelKey} className="flex items-center justify-between text-sm">
            <span className="text-paper/80">{t(row.labelKey)}</span>
            <span className={cn("flex items-center gap-1.5 font-medium", STATE_TEXT[row.state])}>
              <span className={cn("h-1.5 w-1.5 rounded-full", STATE_DOT[row.state])} />
              {t(row.detailKey)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-paper/40">{t("dashboard.student.systemReadiness.permissionHint")}</p>

      <button
        onClick={runActiveCheck}
        disabled={isChecking}
        className={cn(
          "mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-paper",
          "transition-colors duration-150 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {t("dashboard.student.systemReadiness.runCheckAgain")}
      </button>
    </Card>
  );
}
