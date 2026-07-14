// services/examService.ts
//
// Matches the REAL backend routes exactly:
//   GET    /exams
//   GET    /exams/:id
//   POST   /exams
//   PUT    /exams/:id   <-- confirmed PUT (question.routes.ts also
//                            uses PUT — earlier PATCH assumption was
//                            wrong and has been corrected here too)
//   DELETE /exams/:id
//   POST   /exams/:id/questions           (add to curated pool)
//   DELETE /exams/:id/questions/:questionId (remove from curated pool)

import apiClient from "@/lib/axios";
import type { Exam, ExamFormPayload, ExamListFilters, ExamListResponse } from "@/types/exam";

export const examService = {
  async list(filters: ExamListFilters): Promise<ExamListResponse> {
    const { data } = await apiClient.get<ExamListResponse>("/exams", {
      params: {
        subject: filters.subject || undefined,
        page: filters.page,
        limit: filters.limit,
      },
    });
    return data;
  },

  async getById(id: string): Promise<Exam> {
    const { data } = await apiClient.get<Exam>(`/exams/${id}`);
    return data;
  },

  async create(payload: ExamFormPayload): Promise<Exam> {
    const { data } = await apiClient.post<Exam>("/exams", payload);
    return data;
  },

  async update(id: string, payload: ExamFormPayload): Promise<Exam> {
    const { data } = await apiClient.put<Exam>(`/exams/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/exams/${id}`);
  },

  async addPoolQuestions(examId: string, questionIds: string[]): Promise<Exam> {
    const { data } = await apiClient.post<Exam>(`/exams/${examId}/questions`, { questionIds });
    return data;
  },

  async removePoolQuestion(examId: string, questionId: string): Promise<Exam> {
    const { data } = await apiClient.delete<Exam>(`/exams/${examId}/questions/${questionId}`);
    return data;
  },
};
