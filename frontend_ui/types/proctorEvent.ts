// types/proctorEvent.ts

export type ProctorEventType = "WEBCAM_SNAPSHOT" | "GAZE_LOG" | "TAB_SWITCH" | "MULTI_FACE_DETECTED";
export type GazeDirection = "CENTER" | "LEFT" | "RIGHT" | "AWAY";

export interface SubmitProctorEventPayload {
  eventType: "GAZE_LOG" | "TAB_SWITCH" | "MULTI_FACE_DETECTED";
  gazeDirection?: GazeDirection;
  gazeConfidence?: number;
  faceCount?: number;
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
