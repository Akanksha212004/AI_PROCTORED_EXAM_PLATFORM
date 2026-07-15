// // Talks to the REAL backend routes exactly as implemented:
// //   GET    /questions
// //   GET    /questions/:id
// //   POST   /questions
// //   PATCH  /questions/:id   <-- NOT PUT. The live backend route is
// //                               router.patch("/:id", ...), so this
// //                               service uses PATCH to match it.
// //   DELETE /questions/:id
// //   POST   /questions/:id/model-answer  <-- stubbed server-side right
// //                               now (throws "not implemented yet").
// //                               Kept here for when it's wired up.
// //
// // Response shapes match the real controller exactly: list returns
// // { items, pagination } (no envelope), single-question endpoints
// // return the question object directly (no envelope), delete returns
// // 204 with no body.
 
// import apiClient from "@/lib/axios";
// import type {
//   Question,
//   QuestionFormPayload,
//   QuestionListFilters,
//   QuestionListResponse,
// } from "@/types/question";
 
// export const questionService = {
//   async list(filters: Omit<QuestionListFilters, "search">): Promise<QuestionListResponse> {
//     const { data } = await apiClient.get<QuestionListResponse>("/questions", {
//       params: {
//         subject: filters.subject || undefined,
//         questionType: filters.questionType || undefined,
//         difficultyLevel: filters.difficultyLevel || undefined,
//         page: filters.page,
//         limit: filters.limit,
//       },
//     });
//     return data;
//   },
 
//   async getById(id: string): Promise<Question> {
//     const { data } = await apiClient.get<Question>(`/questions/${id}`);
//     return data;
//   },
 
//   async create(payload: QuestionFormPayload): Promise<Question> {
//     const { data } = await apiClient.post<Question>("/questions", payload);
//     return data;
//   },
 
//   async update(id: string, payload: QuestionFormPayload): Promise<Question> {
//     const { data } = await apiClient.put<Question>(`/questions/${id}`, payload);
//     return data;
//   },
 
//   async remove(id: string): Promise<void> {
//     await apiClient.delete(`/questions/${id}`);
//   },
 
//   /**
//    * NOT YET SUPPORTED BY THE BACKEND — the route exists but the
//    * controller currently just throws "Model answer upload is not
//    * implemented yet" (400). Calling this will fail predictably until
//    * that's implemented server-side. Kept here so the UI wiring is
//    * ready the moment it is.
//    */
//   async uploadModelAnswer(id: string, file: File): Promise<Question> {
//     const formData = new FormData();
//     formData.append("file", file);
//     const { data } = await apiClient.post<Question>(
//       `/questions/${id}/model-answer`,
//       formData,
//       { headers: { "Content-Type": "multipart/form-data" } }
//     );
//     return data;
//   },
// };





// services/questionService.ts
//
// Talks to the REAL backend routes exactly as implemented:
//   GET    /questions
//   GET    /questions/:id
//   POST   /questions
//   PUT    /questions/:id
//   DELETE /questions/:id
//   POST   /questions/:id/model-answer   <-- multipart/form-data, field name "file"
//
// Response shapes match the real controller exactly: list returns
// { items, pagination } (no envelope), single-question endpoints
// return the question object directly (no envelope), delete returns
// 204 with no body.

import apiClient from "@/lib/axios";
import type {
  Question,
  QuestionFormPayload,
  QuestionListFilters,
  QuestionListResponse,
} from "@/types/question";

import type { DraftQuestion, BulkImportParseResponse, BulkImportConfirmResponse } from "@/types/bulkImport";

export const questionService = {
  async list(filters: Omit<QuestionListFilters, "search">): Promise<QuestionListResponse> {
    const { data } = await apiClient.get<QuestionListResponse>("/questions", {
      params: {
        subject: filters.subject || undefined,
        questionType: filters.questionType || undefined,
        difficultyLevel: filters.difficultyLevel || undefined,
        page: filters.page,
        limit: filters.limit,
      },
    });
    return data;
  },

  async getById(id: string): Promise<Question> {
    const { data } = await apiClient.get<Question>(`/questions/${id}`);
    return data;
  },

  async create(payload: QuestionFormPayload): Promise<Question> {
    const { data } = await apiClient.post<Question>("/questions", payload);
    return data;
  },

  async update(id: string, payload: QuestionFormPayload): Promise<Question> {
    const { data } = await apiClient.put<Question>(`/questions/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/questions/${id}`);
  },

  /** Uploads the examiner-provided reference solution for an IMAGE_UPLOAD question. */
  async uploadModelAnswer(id: string, file: File): Promise<Question> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<Question>(
      `/questions/${id}/model-answer`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },
    async bulkImportParse(file: File): Promise<DraftQuestion[]> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<BulkImportParseResponse>(
      "/questions/bulk-import/parse",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.questions;
  },

  /** Saves the examiner-reviewed/edited draft list to the Question Bank. */
  async bulkImportConfirm(questions: QuestionFormPayload[]): Promise<Question[]> {
    const { data } = await apiClient.post<BulkImportConfirmResponse>(
      "/questions/bulk-import/confirm",
      { questions }
    );
    return data.questions;
  },
};