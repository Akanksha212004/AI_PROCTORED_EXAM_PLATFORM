// services/proctorEventService.ts

import apiClient from "@/lib/axios";
import type {
  LiveSessionItem,
  SessionEventsResponse,
  SubmitProctorEventPayload,
} from "@/types/proctorEvent";

export const proctorEventService = {
  async submitEvent(sessionId: string, payload: SubmitProctorEventPayload): Promise<void> {
    await apiClient.post(`/proctoring/sessions/${sessionId}/events`, payload);
  },

  async submitSnapshot(sessionId: string, blob: Blob): Promise<void> {
    const formData = new FormData();
    formData.append("file", blob, "snapshot.jpg");
    await apiClient.post(`/proctoring/sessions/${sessionId}/events/snapshot`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
