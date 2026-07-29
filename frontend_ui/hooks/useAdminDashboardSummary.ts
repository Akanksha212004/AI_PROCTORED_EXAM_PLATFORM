"use client";

// hooks/useAdminDashboardSummary.ts

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { adminService } from "@/services/adminService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { AdminDashboardSummary } from "@/types/admin";

export function useAdminDashboardSummary() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDashboardSummary();
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
