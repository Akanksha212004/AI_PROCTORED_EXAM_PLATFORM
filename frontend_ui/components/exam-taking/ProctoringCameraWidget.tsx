// "use client";

// // components/exam-taking/ProctoringCameraWidget.tsx

// import { AlertTriangle, Camera, CameraOff } from "lucide-react";
// import type { RefObject } from "react";
// import type { GazeDirection } from "@/types/proctorEvent";
// import type { MonitoringStatus } from "@/hooks/useFaceMonitoring";

// interface Props {
//   status: MonitoringStatus;
//   faceCount: number | null;
//   gazeDirection: GazeDirection | null;
//   videoRef: RefObject<HTMLVideoElement>;
//   canvasRef: RefObject<HTMLCanvasElement>;
// }

// export function ProctoringCameraWidget({ status, faceCount, gazeDirection, videoRef, canvasRef }: Props) {
//   const isProblem = faceCount !== null && faceCount !== 1;
//   const isLookingAway = gazeDirection === "AWAY";

//   return (
//     // <div className="fixed top-20 right-4 z-40 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-card">
//     <div className="fixed top-24 right-4 z-40 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-card">
//       {/* <div className="relative aspect-video bg-black"> */}
//       <div className="relative aspect-[4/3] bg-black">
//         {/* <video ref={videoRef} muted playsInline className="h-full w-full object-cover" /> */}
//         <video ref={videoRef} muted playsInline className="h-full w-full scale-x-[-1] object-cover" />
//         <canvas ref={canvasRef} className="hidden" />
//         {status !== "active" && (
//           <div className="absolute inset-0 flex items-center justify-center bg-ink/80 text-xs text-muted">
//             {status === "loading" && "Starting camera..."}
//             {status === "denied" && (
//               <span className="flex flex-col items-center gap-1 px-2 text-center">
//                 <CameraOff className="h-4 w-4 text-accent-rose" />
//                 Camera permission denied
//               </span>
//             )}
//             {status === "error" && "Camera unavailable"}
//             {status === "idle" && "Camera off"}
//           </div>
//         )}
//         {status === "active" && (isProblem || isLookingAway) && (
//           <div className="absolute inset-x-0 top-0 flex items-center gap-1 bg-accent-rose/90 px-2 py-1 text-xs font-medium text-white">
//             <AlertTriangle className="h-3.5 w-3.5" />
//             {faceCount === 0 ? "No face detected" : faceCount && faceCount > 1 ? "Multiple faces" : "Look at screen"}
//           </div>
//         )}
//       </div>
//       <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted">
//         <Camera className="h-3 w-3" />
//         {status === "active" ? "Proctoring active" : "Proctoring"}
//       </div>
//     </div>
//   );
// }





"use client";

// components/exam-taking/ProctoringCameraWidget.tsx

import { AlertTriangle, Camera, CameraOff } from "lucide-react";
import { useState, type RefObject } from "react";
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
  const [showDetail, setShowDetail] = useState(false);

  const isProblem = faceCount !== null && faceCount !== 1;
  const isLookingAway = gazeDirection === "AWAY";
  const hasWarning = status === "active" && (isProblem || isLookingAway);

  const warningText =
    faceCount === 0
      ? "No face detected"
      : faceCount && faceCount > 1
      ? "Multiple faces detected"
      : "Look at the screen";

  const warningDetail =
    faceCount === 0
      ? "Your camera doesn't currently see a face. Make sure you're clearly visible and well-lit."
      : faceCount && faceCount > 1
      ? "More than one person appears to be in frame. Only the student taking the exam should be visible."
      : "Your gaze has moved away from the screen for an extended period. Please keep your eyes on the exam.";

  return (
    <div className="fixed top-24 right-4 z-40 w-44 overflow-visible rounded-xl border border-border bg-surface shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-black">
        <video ref={videoRef} muted playsInline className="h-full w-full scale-x-[-1] object-cover" />
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
      </div>

      <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted">
        <Camera className="h-3 w-3" />
        {status === "active" ? "Proctoring active" : "Proctoring"}
      </div>

      {hasWarning && (
        <button
          onClick={() => setShowDetail((v) => !v)}
          className="flex w-full items-center gap-1.5 border-t border-accent-rose/30 bg-accent-rose/90 px-2.5 py-2 text-left text-xs font-medium text-white transition-colors hover:bg-accent-rose"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {warningText}
        </button>
      )}

      {hasWarning && showDetail && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-accent-rose/30 bg-surface p-3 text-xs text-paper/85 shadow-lg">
          {warningDetail}
        </div>
      )}
    </div>
  );
}