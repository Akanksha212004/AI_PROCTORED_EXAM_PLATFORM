// services/examSessionService.ts

import apiClient from "@/lib/axios";
import type {
  AvailableExam,
  ExamSessionView,
  SubmitAnswerPayload,
  SubmitSessionResult,
} from "@/types/examSession";

export const examSessionService = {
  async listAvailable(): Promise<AvailableExam[]> {
    const { data } = await apiClient.get<{ items: AvailableExam[] }>("/exams/available");
    return data.items;
  },

  async startSession(examId: string): Promise<ExamSessionView> {
    const { data } = await apiClient.post<ExamSessionView>(`/exams/${examId}/sessions`);
    return data;
  },

  async getSession(sessionId: string): Promise<ExamSessionView> {
    const { data } = await apiClient.get<ExamSessionView>(`/sessions/${sessionId}`);
    return data;
  },

  async submitAnswer(sessionId: string, payload: SubmitAnswerPayload): Promise<ExamSessionView> {
    const { data } = await apiClient.post<ExamSessionView>(`/sessions/${sessionId}/answers`, payload);
    return data;
  },

  async submitAnswerFile(sessionId: string, questionId: string, file: File): Promise<ExamSessionView> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<ExamSessionView>(
      `/sessions/${sessionId}/answers/${questionId}/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async submitSession(sessionId: string): Promise<SubmitSessionResult> {
    const { data } = await apiClient.post<SubmitSessionResult>(`/sessions/${sessionId}/submit`);
    return data;
  },
};
