import apiClient from "@/lib/axios";
import type { AuthTokenResponse, LoginPayload, RegisterPayload, User } from "@/types/auth";

export const authService = {
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
};
