

// services/proctorEventService.ts

import apiClient from "@/lib/axios";
import type {
  LiveSessionItem,
  ProctorEventRecord,
  SessionEventsResponse,
  SubmitProctorEventPayload,
} from "@/types/proctorEvent";

export const proctorEventService = {
  async submitEvent(sessionId: string, payload: SubmitProctorEventPayload): Promise<void> {
    await apiClient.post(`/proctoring/sessions/${sessionId}/events`, payload);
  },

  async submitSnapshot(sessionId: string, blob: Blob): Promise<ProctorEventRecord> {
    const formData = new FormData();
    formData.append("file", blob, "snapshot.jpg");
    const { data } = await apiClient.post<ProctorEventRecord>(
      `/proctoring/sessions/${sessionId}/events/snapshot`,
      formData,
      { headers: { "Content-Type": undefined } }
    );
    return data;
  },

  /** Uploads a short recorded WAV clip for server-side Voice Activity
   *  Detection. Returns null when ai-service couldn't be reached —
   *  this cycle's audio is simply not analyzed, not an error to
   *  surface to the student. */
  async submitAudioClip(sessionId: string, blob: Blob): Promise<ProctorEventRecord | null> {
    const formData = new FormData();
    formData.append("file", blob, "clip.wav");
    const { data } = await apiClient.post<ProctorEventRecord | null>(
      `/proctoring/sessions/${sessionId}/events/audio`,
      formData,
      { headers: { "Content-Type": undefined } }
    );
    return data;
  },

  async getSessionEvents(sessionId: string, page = 1, limit = 50): Promise<SessionEventsResponse> {
    const { data } = await apiClient.get<SessionEventsResponse>(`/proctoring/sessions/${sessionId}/events`, {
      params: { page, limit },
    });
    return data;
  },

  async getLiveSessions(): Promise<LiveSessionItem[]> {
    const { data } = await apiClient.get<{ items: LiveSessionItem[] }>("/proctoring/live-sessions");
    return data.items;
  },
};