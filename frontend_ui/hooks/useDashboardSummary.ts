"use client";

// hooks/useDashboardSummary.ts

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { dashboardService } from "@/services/dashboardService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { DashboardSummary } from "@/types/dashboard";

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getExaminerSummary();
      setSummary(data);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, refetch: fetchSummary };
}
