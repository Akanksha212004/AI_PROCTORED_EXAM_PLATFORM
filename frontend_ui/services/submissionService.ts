// services/submissionService.ts

import apiClient from "@/lib/axios";
import type {
  GradeAnswerPayload,
  SubmissionDetail,
  SubmissionListResponse,
} from "@/types/submission";

export const submissionService = {
  async list(params: { examId?: string; status?: string; page: number; limit: number }): Promise<SubmissionListResponse> {
    const { data } = await apiClient.get<SubmissionListResponse>("/submissions", { params });
    return data;
  },

  async getById(sessionId: string): Promise<SubmissionDetail> {
    const { data } = await apiClient.get<SubmissionDetail>(`/submissions/${sessionId}`);
    return data;
  },

  async gradeAnswer(answerId: string, payload: GradeAnswerPayload): Promise<SubmissionDetail> {
    const { data } = await apiClient.post<SubmissionDetail>(`/submissions/answers/${answerId}/grade`, payload);
    return data;
  },

  async finalize(sessionId: string): Promise<{ totalMarks: number }> {
    const { data } = await apiClient.post<{ totalMarks: number }>(`/submissions/${sessionId}/finalize`);
    return data;
  },
};
