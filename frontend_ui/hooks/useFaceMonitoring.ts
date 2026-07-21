// "use client";

// // hooks/useFaceMonitoring.ts
// //
// // Real webcam-based detection using face-api.js (TinyFaceDetector +
// // tiny 68-point landmarks — the smallest/fastest models, sufficient
// // for "is exactly one face present" and a rough gaze direction).
// //
// // GAZE HEURISTIC (documented limitation): direction is estimated from
// // eye-landmark position relative to the face bounding box center, not
// // true 3D head-pose/eye-gaze estimation. It's a real, working signal
// // (genuinely reacts to looking away), just not research-grade gaze
// // tracking — flagging this rather than overselling it.
// //
// // Detection runs every DETECTION_INTERVAL_MS. Snapshots (actual JPEG
// // frames) are captured far less often (SNAPSHOT_INTERVAL_MS) since
// // they're larger and only need to be a periodic visual record, not a
// // per-frame signal.

// import { useCallback, useEffect, useRef, useState } from "react";
// import { proctorEventService } from "@/services/proctorEventService";
// import type { GazeDirection } from "@/types/proctorEvent";

// const DETECTION_INTERVAL_MS = 6000;
// const SNAPSHOT_INTERVAL_MS = 45000;
// const MODEL_URL = "/models";

// export type MonitoringStatus = "idle" | "loading" | "active" | "denied" | "error";

// interface FaceApiModule {
//   nets: {
//     tinyFaceDetector: { loadFromUri: (url: string) => Promise<void> };
//     faceLandmark68TinyNet: { loadFromUri: (url: string) => Promise<void> };
//   };
//   TinyFaceDetectorOptions: new () => unknown;
//   detectAllFaces: (
//     input: HTMLVideoElement,
//     options: unknown
//   ) => { withFaceLandmarks: (useTinyModel: boolean) => Promise<DetectionResult[]> };
// }

// interface DetectionResult {
//   detection: { box: { x: number; width: number } };
//   landmarks: {
//     getLeftEye: () => { x: number; y: number }[];
//     getRightEye: () => { x: number; y: number }[];
//   };
// }

// function computeGazeDirection(det: DetectionResult): { direction: GazeDirection; confidence: number } {
//   const leftEye = det.landmarks.getLeftEye();
//   const rightEye = det.landmarks.getRightEye();
//   const eyeCenterX = [...leftEye, ...rightEye].reduce((sum, p) => sum + p.x, 0) / (leftEye.length + rightEye.length);
//   const boxCenterX = det.detection.box.x + det.detection.box.width / 2;
//   const offset = (eyeCenterX - boxCenterX) / det.detection.box.width; // roughly -0.5..0.5

//   if (Math.abs(offset) > 0.18) {
//     return { direction: offset > 0 ? "RIGHT" : "LEFT", confidence: Math.min(1, Math.abs(offset) * 2) };
//   }
//   return { direction: "CENTER", confidence: 1 - Math.abs(offset) * 2 };
// }

// export function useFaceMonitoring(sessionId: string, enabled: boolean) {
//   const [status, setStatus] = useState<MonitoringStatus>("idle");
//   const [faceCount, setFaceCount] = useState<number | null>(null);
//   const [gazeDirection, setGazeDirection] = useState<GazeDirection | null>(null);
//   const [flagCount, setFlagCount] = useState(0);

//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const detectionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const snapshotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const faceapiRef = useRef<FaceApiModule | null>(null);

//   const captureSnapshot = useCallback(async () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas) return;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     canvas.toBlob(
//       (blob) => {
//         if (blob) proctorEventService.submitSnapshot(sessionId, blob).catch(() => undefined);
//       },
//       "image/jpeg",
//       0.7
//     );
//   }, [sessionId]);

//   const runDetection = useCallback(async () => {
//     const video = videoRef.current;
//     const faceapi = faceapiRef.current;
//     if (!video || !faceapi || video.readyState < 2) return;

//     try {
//       const detections = await faceapi
//         .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks(true);

//       setFaceCount(detections.length);

//       if (detections.length !== 1) {
//         const isFlagged = true; // 0 faces (absent) or 2+ faces (multi-face) both flaggable
//         setFlagCount((c) => c + 1);
//         setGazeDirection(null);
//         await proctorEventService.submitEvent(sessionId, {
//           eventType: "MULTI_FACE_DETECTED",
//           faceCount: detections.length,
//           isFlagged,
//         });
//       } else {
//         const { direction, confidence } = computeGazeDirection(detections[0]);
//         setGazeDirection(direction);
//         const isFlagged = direction === "AWAY";
//         if (isFlagged) setFlagCount((c) => c + 1);
//         await proctorEventService.submitEvent(sessionId, {
//           eventType: "GAZE_LOG",
//           gazeDirection: direction,
//           gazeConfidence: confidence,
//           isFlagged,
//         });
//       }
//     } catch {
//       // Transient detection failure (e.g. video not ready yet) — skip this cycle silently.
//     }
//   }, [sessionId]);

//   useEffect(() => {
//     if (!enabled) return;
//     let cancelled = false;

//     async function start() {
//       setStatus("loading");
//       try {
//         const faceapi = await import("face-api.js");
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//           faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
//         ]);
//         // eslint-disable-next-line no-console
//         console.log("Face-api models loaded");
//         faceapiRef.current = faceapi as unknown as FaceApiModule;

//         const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
//         if (cancelled) {
//           stream.getTracks().forEach((t) => t.stop());
//           return;
//         }
//         streamRef.current = stream;
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           await videoRef.current.play();
//         }

//         setStatus("active");
//         detectionTimerRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS);
//         snapshotTimerRef.current = setInterval(captureSnapshot, SNAPSHOT_INTERVAL_MS);
//       } catch (err) {
//         if ((err as DOMException)?.name === "NotAllowedError") {
//           setStatus("denied");
//         } else {
//           setStatus("error");
//         }
//       }
//     }

//     start();

//     return () => {
//       cancelled = true;
//       if (detectionTimerRef.current) clearInterval(detectionTimerRef.current);
//       if (snapshotTimerRef.current) clearInterval(snapshotTimerRef.current);
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//     };
//   }, [enabled, runDetection, captureSnapshot]);

//   return { status, faceCount, gazeDirection, flagCount, videoRef, canvasRef };
// }




"use client";

// hooks/useFaceMonitoring.ts
//
// Camera capture + periodic upload only. All real detection (face
// count, gaze direction) happens server-side: the snapshot is sent to
// the Node backend, which forwards it to ai-service (MediaPipe) and
// applies this exam's gazeSensitivity/multiFaceDetectionEnabled. This
// hook just displays whatever comes back — it never computes anything
// itself.
//
// CAPTURE_INTERVAL_MS: each cycle is a real network round-trip + a
// MediaPipe inference on ai-service, not a cheap in-browser check —
// so this is spaced out further than the old client-side interval was.

import { useCallback, useEffect, useRef, useState } from "react";
import { proctorEventService } from "@/services/proctorEventService";
import type { GazeDirection } from "@/types/proctorEvent";

const CAPTURE_INTERVAL_MS =6000;

export type MonitoringStatus = "idle" | "loading" | "active" | "denied" | "error";

export function useFaceMonitoring(sessionId: string, enabled: boolean) {
  const [status, setStatus] = useState<MonitoringStatus>("idle");
  const [faceCount, setFaceCount] = useState<number | null>(null);
  const [gazeDirection, setGazeDirection] = useState<GazeDirection | null>(null);
  const [flagCount, setFlagCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightRef = useRef(false);

  const captureAndAnalyze = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    if (inFlightRef.current) return; // skip if previous upload/analysis hasn't finished
    inFlightRef.current = true;

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.7)
      );
      if (!blob) return;

      const record = await proctorEventService.submitSnapshot(sessionId, blob);

      setFaceCount(record.faceCount);
      setGazeDirection((record.gazeDirection as GazeDirection | null) ?? null);
      if (record.isFlagged) setFlagCount((c) => c + 1);
    } catch {
      // Transient upload/analysis failure — skip this cycle silently,
      // next interval tick will retry.
    } finally {
      inFlightRef.current = false;
    }
  }, [sessionId]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function start() {
      setStatus("loading");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus("active");
        captureTimerRef.current = setInterval(captureAndAnalyze, CAPTURE_INTERVAL_MS);
      } catch (err) {
        if ((err as DOMException)?.name === "NotAllowedError") {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (captureTimerRef.current) clearInterval(captureTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled, captureAndAnalyze]);

  return { status, faceCount, gazeDirection, flagCount, videoRef, canvasRef };
}