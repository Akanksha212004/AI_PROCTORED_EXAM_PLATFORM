"use client";

// components/exam-taking/PreExamChecklist.tsx
//
// Shown once, right after a session is created and before the student
// sees any question. Mirrors the "system check" screen real proctored
// exam platforms use: guidelines specific to this exam's settings, a
// live camera/mic permission check, and an explicit acknowledgement
// checkbox — only after all of that does "Begin Exam" become clickable.
//
// The getUserMedia stream requested here is ONLY for the permission
// check + live preview. It's stopped the moment the student proceeds;
// useFaceMonitoring requests its own stream once the real exam starts.

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Loader2,
  Maximize2,
  Mic,
  MonitorCheck,
  ShieldAlert,
  TimerReset,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

interface Props {
  examTitle: string;
  examSubject: string;
  durationMinutes: number;
  fullScreenModeEnabled: boolean;
  webcamMonitoringEnabled: boolean;
  audioMonitoringEnabled: boolean;
  multiFaceDetectionEnabled: boolean;
  negativeMarkingEnabled: boolean;
  maxTabSwitchWarnings: number;
  onBegin: () => void;
}

type MediaCheckStatus = "not_required" | "idle" | "requesting" | "granted" | "denied" | "error";

export function PreExamChecklist({
  examTitle,
  examSubject,
  durationMinutes,
  fullScreenModeEnabled,
  webcamMonitoringEnabled,
  audioMonitoringEnabled,
  multiFaceDetectionEnabled,
  negativeMarkingEnabled,
  maxTabSwitchWarnings,
  onBegin,
}: Props) {
  const mediaRequired = webcamMonitoringEnabled || audioMonitoringEnabled;

  const [mediaStatus, setMediaStatus] = useState<MediaCheckStatus>(
    mediaRequired ? "idle" : "not_required"
  );
  const [acknowledged, setAcknowledged] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop the preview stream on unmount (e.g. student navigates away
  // before starting) so the camera light actually turns off.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function requestMediaAccess() {
    setMediaStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: webcamMonitoringEnabled ? { width: 320, height: 240 } : false,
        audio: audioMonitoringEnabled,
      });
      streamRef.current = stream;
      if (webcamMonitoringEnabled && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMediaStatus("granted");
    } catch (err) {
      if ((err as DOMException)?.name === "NotAllowedError") {
        setMediaStatus("denied");
      } else {
        setMediaStatus("error");
      }
    }
  }

  function handleBegin() {
    // Release the preview stream — the real exam camera hook opens its
    // own stream once the exam actually starts.
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    onBegin();
  }

  const canBegin = acknowledged && (mediaStatus === "granted" || mediaStatus === "not_required");

  const mediaLabel =
    webcamMonitoringEnabled && audioMonitoringEnabled
      ? "camera and microphone"
      : webcamMonitoringEnabled
      ? "camera"
      : "microphone";

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-ink">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-sky/15">
              <ShieldAlert className="h-5 w-5 text-accent-sky" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-paper">Before you begin</h1>
              <p className="text-sm text-muted">
                {examTitle} · {examSubject}
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="mt-6 space-y-3 rounded-xl border border-border bg-surface-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Exam guidelines</p>

            <GuidelineRow
              icon={<TimerReset className="h-4 w-4" />}
              text={`You will have ${durationMinutes} minute${durationMinutes === 1 ? "" : "s"} to complete this exam. The timer will not pause once started.`}
            />

            {fullScreenModeEnabled && (
              <GuidelineRow
                icon={<Maximize2 className="h-4 w-4" />}
                text={`This exam must be taken in fullscreen mode. Exiting fullscreen or switching tabs is treated as a violation — after ${maxTabSwitchWarnings} warning${maxTabSwitchWarnings === 1 ? "" : "s"}, your exam will be auto-submitted.`}
              />
            )}

            {webcamMonitoringEnabled && (
              <GuidelineRow
                icon={<Camera className="h-4 w-4" />}
                text="Your webcam will stay on and be periodically monitored for the entire exam. Sit somewhere well-lit and keep your face in frame."
              />
            )}

            {multiFaceDetectionEnabled && (
              <GuidelineRow
                icon={<Users className="h-4 w-4" />}
                text="Only you should be visible on camera. Other people entering the frame will be flagged."
              />
            )}

            {audioMonitoringEnabled && (
              <GuidelineRow
                icon={<Mic className="h-4 w-4" />}
                text="Your microphone will be monitored for the duration of the exam. Keep your surroundings quiet."
              />
            )}

            {negativeMarkingEnabled && (
              <GuidelineRow
                icon={<AlertTriangle className="h-4 w-4" />}
                text="This exam has negative marking — incorrect answers may deduct marks."
              />
            )}

            <GuidelineRow
              icon={<MonitorCheck className="h-4 w-4" />}
              text="Do not refresh, close, or navigate away from this tab once the exam has started."
            />
          </div>

          {/* Camera / mic check */}
          {mediaRequired && (
            <div className="mt-6 rounded-xl border border-border bg-surface-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">System check</p>
              <p className="mt-1 text-sm text-paper/85">
                We need permission to use your {mediaLabel} for proctoring before the exam can start.
              </p>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                {webcamMonitoringEnabled && (
                  <div className="relative aspect-[4/3] w-full max-w-[220px] shrink-0 overflow-hidden rounded-lg bg-black">
                    <video ref={videoRef} muted playsInline className="h-full w-full scale-x-[-1] object-cover" />
                    {mediaStatus !== "granted" && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">
                        {mediaStatus === "requesting" ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 opacity-40" />
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  {mediaStatus === "idle" && (
                    <Button onClick={requestMediaAccess} className="w-auto px-4">
                      <Camera className="h-4 w-4" /> Enable {mediaLabel}
                    </Button>
                  )}

                  {mediaStatus === "requesting" && (
                    <p className="flex items-center gap-2 text-sm text-muted">
                      <Loader2 className="h-4 w-4 animate-spin" /> Waiting for browser permission...
                    </p>
                  )}

                  {mediaStatus === "granted" && (
                    <p className="flex items-center gap-2 text-sm font-medium text-accent-teal">
                      <CheckCircle2 className="h-4 w-4" /> {mediaLabel[0].toUpperCase() + mediaLabel.slice(1)} ready
                    </p>
                  )}

                  {mediaStatus === "denied" && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm font-medium text-accent-rose">
                        <AlertTriangle className="h-4 w-4" /> Permission denied
                      </p>
                      <p className="text-xs text-muted">
                        Allow camera/microphone access in your browser's site settings, then try again. This exam
                        cannot be started without it.
                      </p>
                      <Button variant="secondary" onClick={requestMediaAccess} className="w-auto px-4">
                        Try Again
                      </Button>
                    </div>
                  )}

                  {mediaStatus === "error" && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm font-medium text-accent-rose">
                        <AlertTriangle className="h-4 w-4" /> Couldn't access your device
                      </p>
                      <p className="text-xs text-muted">
                        Make sure no other application is using your camera or microphone, then try again.
                      </p>
                      <Button variant="secondary" onClick={requestMediaAccess} className="w-auto px-4">
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Acknowledgement */}
          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-muted/40 p-4">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-accent-sky"
            />
            <span className="text-sm text-paper/85">
              I have read and understood the guidelines above, and I agree to be monitored as described for the
              duration of this exam.
            </span>
          </label>

          <Button onClick={handleBegin} disabled={!canBegin} className="mt-6 w-auto px-6">
            Begin Exam
          </Button>
        </div>
      </div>
    </div>
  );
}

function GuidelineRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-paper/85">
      <span className="mt-0.5 shrink-0 text-accent-sky">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
