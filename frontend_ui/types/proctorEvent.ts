

// types/proctorEvent.ts

export type ProctorEventType = "WEBCAM_SNAPSHOT" | "GAZE_LOG" | "TAB_SWITCH" | "MULTI_FACE_DETECTED" | "MOBILE_PHONE_DETECTED" | "AUDIO_ANOMALY" | "FULLSCREEN_EXIT";
export type GazeDirection = "CENTER" | "LEFT" | "RIGHT" | "AWAY";

/** Only TAB_SWITCH and FULLSCREEN_EXIT are client-submittable via this generic endpoint.
 *  GAZE_LOG / MULTI_FACE_DETECTED / AUDIO_ANOMALY are all created
 *  server-side, from ai-service's analysis of an uploaded snapshot or
 *  audio clip — never trusted from the client directly. */
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
  audioLevel: number | null;
  mobileDeviceDetected: boolean;
  mobileDeviceConfidence: number | null;
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