"use client";

// hooks/useExamHistory.ts
//
// Powers the full "Exam History" page (/dashboard/student/history).
// Reuses examSessionService.listMine() — same function
// useStudentDashboard.ts uses for its "recent 3" preview — with its
// own page/limit state so the two hooks don't fight over shared state.

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { examSessionService } from "@/services/examSessionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { MySubmissionListItem } from "@/types/examSession";

const PAGE_SIZE = 10;

export function useExamHistory() {
  const [items, setItems] = useState<MySubmissionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPage = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    try {
      const data = await examSessionService.listMine(targetPage, PAGE_SIZE);
      setItems(data.items);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const goToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
      fetchPage(targetPage);
    },
    [fetchPage, page, totalPages]
  );

  return {
    items,
    page,
    totalPages,
    total,
    isLoading,
    goToPage,
    nextPage: () => goToPage(page + 1),
    prevPage: () => goToPage(page - 1),
  };
}