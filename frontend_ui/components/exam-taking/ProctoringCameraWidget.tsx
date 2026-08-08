
"use client";

// components/exam-taking/ProctoringCameraWidget.tsx

import React, { memo } from "react";

import { AlertTriangle, Camera, CameraOff } from "lucide-react";
import { useState, type RefObject } from "react";
import type { GazeDirection } from "@/types/proctorEvent";
import type { MonitoringStatus } from "@/hooks/useFaceMonitoring";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

interface Props {
  status: MonitoringStatus;
  faceCount: number | null;
  gazeDirection: GazeDirection | null;
  mobileDeviceDetected: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  /** Extra classes for sizing/placement — lets callers fit this into whatever
   *  layout slot they need (header row, sidebar, etc.) instead of the widget
   *  dictating its own position. */
  className?: string;
}

// export function ProctoringCameraWidget({
export const ProctoringCameraWidget = memo(function ProctoringCameraWidget({
  status,
  faceCount,
  gazeDirection,
  mobileDeviceDetected,
  videoRef,
  canvasRef,
  className,
}: Props) {
  const { t } = useI18n();
  const [showDetail, setShowDetail] = useState(false);

  const isProblem = faceCount !== null && faceCount !== 1;
  const isLookingAway = gazeDirection === "AWAY";
  const hasWarning = status === "active" && (isProblem || isLookingAway || mobileDeviceDetected);

  const warningText = mobileDeviceDetected
    ? t("examTaking.camera.warningMobileDetected")
    : faceCount === 0
      ? t("examTaking.camera.warningNoFace")
      : faceCount && faceCount > 1
        ? t("examTaking.camera.warningMultipleFaces")
        : t("examTaking.camera.warningLookAtScreen");

  const warningDetail = mobileDeviceDetected
    ? t("examTaking.camera.detailMobileDetected")
    : faceCount === 0
      ? t("examTaking.camera.detailNoFace")
      : faceCount && faceCount > 1
        ? t("examTaking.camera.detailMultipleFaces")
        : t("examTaking.camera.detailLookAway");

  return (
    <div
      className={cn(
        // Mobile/tablet: bigger, in-flow beside the legend (can't overlap
        // anything) — the warning bar no longer eats into this space, so
        // the camera itself gets to be the larger element. Desktop (lg+):
        // reverts to the exact original design — a fixed widget floating
        // top-right of the viewport.
        "relative z-10 w-32 shrink-0 overflow-visible rounded-xl border border-border bg-surface shadow-card sm:w-40 md:w-48 lg:fixed lg:right-4 lg:top-24 lg:z-40 lg:w-44 lg:shrink",
        className
      )}
    >
      {/* Separate clipping wrapper (not the outer border box) so the corner
       *  radius always matches whatever is actually visible inside — on
       *  mobile that's just the video, on sm+ it's video + status label —
       *  instead of leaving a leftover sliver of background where the
       *  hidden label used to sit. */}
      <div className="flex h-full flex-col overflow-hidden rounded-xl">
        <div className="relative flex-1 bg-black lg:aspect-[4/3] lg:flex-none">
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 h-full w-full scale-x-[-1] object-cover object-center"
          />
          <canvas ref={canvasRef} className="hidden" />
          {status !== "active" && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/80 text-xs text-muted">
              {status === "loading" && t("examTaking.camera.startingCamera")}
              {status === "denied" && (
                <span className="flex flex-col items-center gap-1 px-2 text-center">
                  <CameraOff className="h-4 w-4 text-accent-rose" />
                  {t("examTaking.camera.permissionDenied")}
                </span>
              )}
              {status === "error" && t("examTaking.camera.unavailable")}
              {status === "idle" && t("examTaking.camera.off")}
            </div>
          )}

          {/* Small live indicator on mobile/tablet (kept minimal so the
           *  video fills the whole box there). Desktop (lg+) keeps the
           *  original text status bar, unchanged. */}
          {status === "active" && (
            <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-ink/60 px-1.5 py-0.5 lg:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
            </div>
          )}

          {/* Mobile/tablet: warning shown as a small floating popup over the
           *  video itself, instead of a bar below it — so it never takes
           *  layout space away from the camera. Desktop (lg+) keeps the
           *  original in-flow bar below, unchanged. */}
          {hasWarning && (
            <button
              onClick={() => setShowDetail((v) => !v)}
              className="absolute inset-x-1 bottom-1 z-20 flex items-center gap-1 rounded-lg bg-accent-rose/95 px-1.5 py-1 text-left text-[10px] font-medium leading-tight text-white shadow-lg lg:hidden"
            >
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span className="truncate">{warningText}</span>
            </button>
          )}
        </div>

        <div className="hidden items-center gap-1.5 border-t border-border px-2 py-1.5 text-xs text-muted lg:flex">
          <Camera className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {status === "active" ? t("examTaking.camera.proctoringActive") : t("examTaking.camera.proctoring")}
          </span>
        </div>

        {hasWarning && (
          <button
            onClick={() => setShowDetail((v) => !v)}
            className="hidden w-full items-center gap-1.5 border-t border-accent-rose/30 bg-accent-rose/90 px-2.5 py-2 text-left text-sm font-medium text-white transition-colors hover:bg-accent-rose lg:flex"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="truncate">{warningText}</span>
          </button>
        )}
      </div>

      {hasWarning && showDetail && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-accent-rose/30 bg-surface p-3 text-xs text-paper/85 shadow-lg">
          {warningDetail}
        </div>
      )}
    </div>
  );
});
