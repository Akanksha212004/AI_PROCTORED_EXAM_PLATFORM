"use client";

import { STATIC_FILE_ORIGIN } from "@/lib/axios";

import { AlertTriangle, Camera, Eye, MonitorX, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { proctorEventService } from "@/services/proctorEventService";
import type { LiveSessionItem, ProctorEventRecord } from "@/types/proctorEvent";

interface Props {
  session: Pick<LiveSessionItem, "sessionId" | "studentName"> | null;
  onClose: () => void;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  WEBCAM_SNAPSHOT: <Camera className="h-4 w-4" />,
  GAZE_LOG: <Eye className="h-4 w-4" />,
  TAB_SWITCH: <MonitorX className="h-4 w-4" />,
  MULTI_FACE_DETECTED: <Users className="h-4 w-4" />,
};

function eventLabel(e: ProctorEventRecord): string {
  switch (e.eventType) {
    case "WEBCAM_SNAPSHOT":
      return "Webcam snapshot captured";
    case "GAZE_LOG":
      return `Gaze: ${e.gazeDirection ?? "unknown"}${e.gazeConfidence ? ` (${Math.round(e.gazeConfidence * 100)}% confidence)` : ""}`;
    case "TAB_SWITCH":
      return "Left the exam tab";
    case "MULTI_FACE_DETECTED":
      return e.faceCount === 0 ? "No face detected" : `${e.faceCount} faces detected`;
    default:
      return e.eventType;
  }
}

export function SessionEventTimeline({ session, onClose }: Props) {
  const [events, setEvents] = useState<ProctorEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setIsLoading(true);
    proctorEventService
      .getSessionEvents(session.sessionId, 1, 100)
      .then((res) => setEvents(res.items))
      .finally(() => setIsLoading(false));
  }, [session]);

  // const snapshots = events.filter((e) => e.eventType === "WEBCAM_SNAPSHOT" && e.snapshotUrl);

  const snapshots = events.filter((e) => e.snapshotUrl);

  return (
    <Dialog
      open={Boolean(session)}
      onClose={onClose}
      title={session ? `Proctoring — ${session.studentName}` : "Proctoring"}
      size="lg"
    >
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted">Loading events...</p>
      ) : (
        <div className="space-y-6">
          {snapshots.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Webcam Snapshots ({snapshots.length})
              </p>
              <div className="grid grid-cols-4 gap-2">
                {snapshots.slice(0, 8).map((s) => (
                  <a key={s.id} href={`${STATIC_FILE_ORIGIN}${s.snapshotUrl}`} target="_blank" rel="noreferrer">
                    <img
                      src={`${STATIC_FILE_ORIGIN}${s.snapshotUrl}`}
                      alt="Webcam snapshot"
                      className="aspect-video w-full rounded-lg border border-border object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Event Log</p>
            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {events.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No events yet.</p>
              ) : (
                events.map((e) => (
                  <div
                    key={e.id}
                    className={`flex items-center gap-3 rounded-lg border px-3.5 py-2 text-sm ${e.isFlagged ? "border-accent-rose/30 bg-accent-rose/5" : "border-border"
                      }`}
                  >
                    <div className={`rounded-md p-1.5 ${e.isFlagged ? "bg-accent-rose/15 text-accent-rose" : "bg-white/5 text-muted"}`}>
                      {EVENT_ICONS[e.eventType]}
                    </div>
                    <span className="flex-1 text-paper">{eventLabel(e)}</span>
                    {e.isFlagged && (
                      <Badge tone="rose">
                        <AlertTriangle className="mr-1 h-3 w-3" /> Flagged
                      </Badge>
                    )}
                    <span className="text-xs text-muted">{new Date(e.occurredAt).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
