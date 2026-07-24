// types/proctorEvent.ts

export type ProctorEventType =
  | "WEBCAM_SNAPSHOT"
  | "GAZE_LOG"
  | "TAB_SWITCH"
  | "MULTI_FACE_DETECTED"
  | "FULLSCREEN_EXIT";
export type GazeDirection = "CENTER" | "LEFT" | "RIGHT" | "AWAY";

/** TAB_SWITCH and FULLSCREEN_EXIT are the only client-submittable events —
 *  GAZE_LOG / MULTI_FACE_DETECTED are created server-side from ai-service's
 *  analysis, never trusted from the client. */
export interface SubmitProctorEventPayload {
  eventType: "TAB_SWITCH" | "FULLSCREEN_EXIT";
  isFlagged?: boolean;
}

export interface ProctorEventRecord {
  id: string;
  eventType: ProctorEventType;
  snapshotUrl: string | null;
  gazeDirection: string | null;
  gazeConfidence: number | null;
  faceCount: number | null;
  isFlagged: boolean;
  occurredAt: string;
}

export interface SessionEventsResponse {
  items: ProctorEventRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface LiveSessionItem {
  sessionId: string;
  studentName: string;
  studentEmail: string;
  examId: string;
  examTitle: string;
  startTime: string;
  tabSwitchWarnings: number;
  maxTabSwitchWarnings: number;
  flaggedEventCount: number;
  latestSnapshotUrl: string | null;
}
