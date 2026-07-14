// services/dashboardService.ts

import apiClient from "@/lib/axios";
import type { DashboardSummary } from "@/types/dashboard";

export const dashboardService = {
  async getExaminerSummary(): Promise<DashboardSummary> {
    const { data } = await apiClient.get<DashboardSummary>("/examiner/dashboard-summary");
    return data;
  },
};
