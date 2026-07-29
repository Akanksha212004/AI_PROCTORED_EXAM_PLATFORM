import apiClient from "@/lib/axios";
import type {
  AuthTokenResponse,
  ExaminerAccessRequestPayload,
  LoginPayload,
  RegisterPayload,
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
};
