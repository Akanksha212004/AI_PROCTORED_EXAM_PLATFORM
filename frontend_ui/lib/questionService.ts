
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
//     const { data } = await apiClient.patch<Question>(`/questions/${id}`, payload);
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




import apiClient from "@/lib/axios";
import type {
  Question,
  QuestionFormPayload,
  QuestionListFilters,
  QuestionListResponse,
} from "@/types/question";

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
    // CONFIRMED: the real route is router.put("/:id", ...), not PATCH —
    // earlier assumption was wrong, fixed here.
    const { data } = await apiClient.put<Question>(`/questions/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/questions/${id}`);
  },

  /**
   * NOT YET SUPPORTED BY THE BACKEND — the route exists but the
   * controller currently just throws "Model answer upload is not
   * implemented yet" (400). Calling this will fail predictably until
   * that's implemented server-side. Kept here so the UI wiring is
   * ready the moment it is.
   */
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
};
