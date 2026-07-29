// services/adminService.ts

import apiClient from "@/lib/axios";
import type {
  AdminDashboardSummary,
  CreateUserPayload,
  ExaminerApprovalStatus,
  ExaminerRequest,
  ExaminerRequestsResponse,
  PlatformRole,
  PlatformUser,
  PlatformUsersResponse,
} from "@/types/admin";

export interface ListUsersParams {
  search?: string;
  role?: PlatformRole;
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
}

export interface ListExaminerRequestsParams {
  /** Defaults to PENDING on the backend if omitted. */
  status?: ExaminerApprovalStatus;
  page?: number;
  limit?: number;
}

export const adminService = {
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const { data } = await apiClient.get<AdminDashboardSummary>("/admin/dashboard-summary");
    return data;
  },

  async listUsers(params: ListUsersParams): Promise<PlatformUsersResponse> {
    const { data } = await apiClient.get<PlatformUsersResponse>("/admin/users", { params });
    return data;
  },

  async createUser(payload: CreateUserPayload): Promise<PlatformUser> {
    const { data } = await apiClient.post<PlatformUser>("/admin/users", payload);
    return data;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<PlatformUser> {
    const { data } = await apiClient.patch<PlatformUser>(`/admin/users/${userId}/status`, { isActive });
    return data;
  },

  async updateUserRole(userId: string, role: PlatformRole): Promise<PlatformUser> {
    const { data } = await apiClient.patch<PlatformUser>(`/admin/users/${userId}/role`, { role });
    return data;
  },

  async listExaminerRequests(params: ListExaminerRequestsParams): Promise<ExaminerRequestsResponse> {
    const { data } = await apiClient.get<ExaminerRequestsResponse>("/admin/examiner-requests", { params });
    return data;
  },

  async approveExaminerRequest(userId: string): Promise<ExaminerRequest> {
    const { data } = await apiClient.patch<ExaminerRequest>(`/admin/examiner-requests/${userId}/approve`);
    return data;
  },

  async rejectExaminerRequest(userId: string, reason?: string): Promise<ExaminerRequest> {
    const { data } = await apiClient.patch<ExaminerRequest>(`/admin/examiner-requests/${userId}/reject`, {
      reason,
    });
    return data;
  },
};
