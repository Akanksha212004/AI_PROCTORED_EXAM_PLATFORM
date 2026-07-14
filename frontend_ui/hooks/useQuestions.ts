"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
 
import { questionService } from "@/services/questionService";
import type {
  Question,
  QuestionListFilters,
  QuestionPagination,
} from "@/types/question";
import { extractQuestionErrorMessage } from "@/lib/questionErrors";
 
const SEARCH_FETCH_LIMIT = 100;
 
export function useQuestions(filters: QuestionListFilters) {
  const [items, setItems] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<QuestionPagination>({
    page: filters.page,
    limit: filters.limit,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const hasSearch = Boolean(filters.search && filters.search.trim().length > 0);
 
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (hasSearch) {
        const result = await questionService.list({
          subject: filters.subject,
          questionType: filters.questionType,
          difficultyLevel: filters.difficultyLevel,
          page: 1,
          limit: SEARCH_FETCH_LIMIT,
        });
        const term = filters.search!.trim().toLowerCase();
        const filtered = result.items.filter((q) =>
          q.questionText.toLowerCase().includes(term)
        );
        const start = (filters.page - 1) * filters.limit;
        const pageItems = filtered.slice(start, start + filters.limit);
        setItems(pageItems);
        setPagination({
          page: filters.page,
          limit: filters.limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / filters.limit)),
        });
      } else {
        const result = await questionService.list({
          subject: filters.subject,
          questionType: filters.questionType,
          difficultyLevel: filters.difficultyLevel,
          page: filters.page,
          limit: filters.limit,
        });
        setItems(result.items);
        setPagination(result.pagination);
      }
    } catch (err) {
      const message = extractQuestionErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.subject,
    filters.questionType,
    filters.difficultyLevel,
    filters.page,
    filters.limit,
    filters.search,
    hasSearch,
  ]);
 
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
 
  const stats = useMemo(() => {
    const subjectSet = new Set(items.map((q) => q.subject));
    const difficultyCounts = { EASY: 0, MEDIUM: 0, HARD: 0 } as Record<string, number>;
    items.forEach((q) => {
      difficultyCounts[q.difficultyLevel] = (difficultyCounts[q.difficultyLevel] ?? 0) + 1;
    });
    return {
      subjectCountOnPage: subjectSet.size,
      difficultyCountsOnPage: difficultyCounts,
    };
  }, [items]);
 
  return {
    items,
    pagination,
    isLoading,
    error,
    stats,
    refetch: fetchQuestions,
  };
}