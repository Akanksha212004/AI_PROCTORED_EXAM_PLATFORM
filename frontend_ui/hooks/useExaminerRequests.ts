"use client";

// hooks/useExaminerRequests.ts

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { adminService, type ListExaminerRequestsParams } from "@/services/adminService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { ExaminerRequestsResponse } from "@/types/admin";

export function useExaminerRequests(params: ListExaminerRequestsParams) {
  const [data, setData] = useState<ExaminerRequestsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.listExaminerRequests(params);
      setData(result);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.status, params.page, params.limit]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    items: data?.items ?? [],
    pagination: {
      page: data?.page ?? 1,
      limit: data?.limit ?? 20,
      total: data?.total ?? 0,
      totalPages: data?.totalPages ?? 1,
    },
    isLoading,
    refetch: fetchRequests,
  };
}
