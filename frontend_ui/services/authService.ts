import apiClient from "@/lib/axios";
import type {
  AuthTokenResponse,
  ExaminerAccessRequestPayload,
  ExaminerRequestStatusQuery,
  ExaminerRequestStatusResponse,
  LoginPayload,
  RegisterPayload,
  ResubmitExaminerAccessRequestPayload,
  User,
} from "@/types/auth";

export const authService = {
  /** Student-only self-registration. */
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await apiClient.post<User>("/auth/register", payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthTokenResponse> {
    const { data } = await apiClient.post<AuthTokenResponse>("/auth/login", payload);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
  },

  /**
   * Submits the Examiner Portal's "Request Examiner Access" form.
   * Creates a PENDING examiner account — no token is returned, the
   * applicant must wait for admin approval before they can log in.
   */
  async requestExaminerAccess(payload: ExaminerAccessRequestPayload): Promise<User> {
    const { data } = await apiClient.post<User>("/auth/examiner-access-request", payload);
    return data;
  },

  /**
   * Examiner Portal's "View Request Status" lookup — pass EITHER
   * requestId OR email (whichever the applicant has on hand).
   *
   * NOTE (backend): this endpoint does not exist yet. It needs to be
   * added as a public route, e.g.
   *   GET /auth/examiner-access-request/status?requestId=...
   *   GET /auth/examiner-access-request/status?email=...
   * returning 404 when no matching request is found, and the request's
   * current approvalStatus (+ rejectionReason when REJECTED) otherwise.
   */
  async getExaminerRequestStatus(
    query: ExaminerRequestStatusQuery
  ): Promise<ExaminerRequestStatusResponse> {
    const { data } = await apiClient.get<ExaminerRequestStatusResponse>(
      "/auth/examiner-access-request/status",
      { params: query }
    );
    return data;
  },

  /**
   * Lets a REJECTED applicant edit and resubmit their existing request
   * (instead of filing a brand new one). Flips approvalStatus back to
   * PENDING and clears rejectionReason server-side.
   *
   * NOTE (backend): this endpoint does not exist yet. It needs to be
   * added as a public route, e.g.
   *   PATCH /auth/examiner-access-request/:requestId/resubmit
   * and should reject the call (400/409) unless the request's current
   * status is REJECTED.
   */
  async resubmitExaminerAccessRequest(
    requestId: string,
    payload: ResubmitExaminerAccessRequestPayload
  ): Promise<ExaminerRequestStatusResponse> {
    const { data } = await apiClient.patch<ExaminerRequestStatusResponse>(
      `/auth/examiner-access-request/${requestId}/resubmit`,
      payload
    );
    return data;
  },
};
