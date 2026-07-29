"use client";

// hooks/useAdminUsers.ts

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { adminService, type ListUsersParams } from "@/services/adminService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { PlatformUsersResponse } from "@/types/admin";

export function useAdminUsers(params: ListUsersParams) {
  const [data, setData] = useState<PlatformUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.listUsers(params);
      setData(result);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search, params.role, params.status, params.page, params.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    items: data?.items ?? [],
    pagination: {
      page: data?.page ?? 1,
      limit: data?.limit ?? 20,
      total: data?.total ?? 0,
      totalPages: data?.totalPages ?? 1,
    },
    isLoading,
    refetch: fetchUsers,
  };
}
