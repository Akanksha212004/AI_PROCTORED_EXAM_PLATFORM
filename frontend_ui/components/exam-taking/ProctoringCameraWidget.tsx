"use client";

// components/exam-taking/ProctoringCameraWidget.tsx

import { AlertTriangle, Camera, CameraOff } from "lucide-react";
import type { RefObject } from "react";
import type { GazeDirection } from "@/types/proctorEvent";
import type { MonitoringStatus } from "@/hooks/useFaceMonitoring";

interface Props {
  status: MonitoringStatus;
  faceCount: number | null;
  gazeDirection: GazeDirection | null;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
}

export function ProctoringCameraWidget({ status, faceCount, gazeDirection, videoRef, canvasRef }: Props) {
  const isProblem = faceCount !== null && faceCount !== 1;
  const isLookingAway = gazeDirection === "AWAY";

  return (
    <div className="fixed bottom-4 right-4 z-40 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {status !== "active" && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/80 text-xs text-muted">
            {status === "loading" && "Starting camera..."}
            {status === "denied" && (
              <span className="flex flex-col items-center gap-1 px-2 text-center">
                <CameraOff className="h-4 w-4 text-accent-rose" />
                Camera permission denied
              </span>
            )}
            {status === "error" && "Camera unavailable"}
            {status === "idle" && "Camera off"}
          </div>
        )}
        {status === "active" && (isProblem || isLookingAway) && (
          <div className="absolute inset-x-0 top-0 flex items-center gap-1 bg-accent-rose/90 px-2 py-1 text-xs font-medium text-white">
            <AlertTriangle className="h-3.5 w-3.5" />
            {faceCount === 0 ? "No face detected" : faceCount && faceCount > 1 ? "Multiple faces" : "Look at screen"}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted">
        <Camera className="h-3 w-3" />
        {status === "active" ? "Proctoring active" : "Proctoring"}
      </div>
    </div>
  );
}
