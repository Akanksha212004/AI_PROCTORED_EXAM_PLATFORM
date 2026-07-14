"use client";

// hooks/useExams.ts

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { examService } from "@/services/examService";
import type { Exam, ExamListFilters, ExamPagination } from "@/types/exam";
import { extractExamErrorMessage } from "@/components/exams/examErrors";

export function useExams(filters: ExamListFilters) {
  const [items, setItems] = useState<Exam[]>([]);
  const [pagination, setPagination] = useState<ExamPagination>({
    page: filters.page,
    limit: filters.limit,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await examService.list(filters);
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      const message = extractExamErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters.subject, filters.page, filters.limit]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { items, pagination, isLoading, error, refetch: fetchExams };
}
