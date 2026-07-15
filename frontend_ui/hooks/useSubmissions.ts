// "use client";

// // hooks/useSubmissions.ts

// import { useCallback, useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";

// import { submissionService } from "@/services/submissionService";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import type { SubmissionListItem, SubmissionPagination } from "@/types/submission";

// export interface SubmissionFilters {
//   examId?: string;
//   status?: string;
//   page: number;
//   limit: number;
// }

// export function useSubmissions(filters: SubmissionFilters) {
//   const [items, setItems] = useState<SubmissionListItem[]>([]);
//   const [pagination, setPagination] = useState<SubmissionPagination>({
//     page: filters.page,
//     limit: filters.limit,
//     total: 0,
//     totalPages: 0,
//   });
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchSubmissions = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const result = await submissionService.list(filters);
//       setItems(result.items);
//       setPagination(result.pagination);
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsLoading(false);
//     }
//   }, [filters.examId, filters.status, filters.page, filters.limit]);

//   useEffect(() => {
//     fetchSubmissions();
//   }, [fetchSubmissions]);

//   const stats = useMemo(() => {
//     const pendingCount = items.filter((i) => i.gradingStatus === "PENDING_REVIEW").length;
//     const gradedCount = items.filter((i) => i.gradingStatus === "FULLY_GRADED").length;
//     return {
//       totalSubmissions: pagination.total,
//       pendingCount,
//       gradedCount,
//     };
//   }, [items, pagination.total]);

//   return { items, pagination, isLoading, stats, refetch: fetchSubmissions };
// }




// "use client";
 
// // hooks/useSubmissions.ts
 
// import { useCallback, useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
 
// import { submissionService } from "@/services/submissionService";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import type { SubmissionListItem, SubmissionPagination } from "@/types/submission";
 
// export interface SubmissionFilters {
//   examId?: string;
//   status?: string;
//   page: number;
//   limit: number;
// }
 
// export function useSubmissions(filters: SubmissionFilters) {
//   const [items, setItems] = useState<SubmissionListItem[]>([]);
//   const [pagination, setPagination] = useState<SubmissionPagination>({
//     page: filters.page,
//     limit: filters.limit,
//     total: 0,
//     totalPages: 0,
//   });
//   const [isLoading, setIsLoading] = useState(true);
 
//   const fetchSubmissions = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const result = await submissionService.list(filters);
//       setItems(result.items);
//       setPagination(result.pagination);
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsLoading(false);
//     }
//   }, [filters.examId, filters.status, filters.page, filters.limit]);
 
//   useEffect(() => {
//     fetchSubmissions();
//   }, [fetchSubmissions]);
 
//   const stats = useMemo(() => {
//     const pendingCount = items.filter((i) => i.gradingStatus === "PENDING_REVIEW").length;
//     const gradedCount = items.filter((i) => i.gradingStatus === "FULLY_GRADED").length;
//     const autoGradedCount = items.filter((i) => i.gradingStatus === "FULLY_AUTO_GRADED").length;
//     return {
//       totalSubmissions: pagination.total,
//       pendingCount,
//       gradedCount,
//       autoGradedCount,
//       /** Number of items the breakdown above is actually computed from (== items.length, i.e. this page/limit, not `total`). */
//       sampleSize: items.length,
//     };
//   }, [items, pagination.total]);
 
//   return { items, pagination, isLoading, stats, refetch: fetchSubmissions };
// }






"use client";

// hooks/useSubmissions.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { submissionService } from "@/services/submissionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { SubmissionListItem, SubmissionPagination } from "@/types/submission";

export interface SubmissionFilters {
  examId?: string;
  status?: string;
  page: number;
  limit: number;
}

export function useSubmissions(filters: SubmissionFilters) {
  const [items, setItems] = useState<SubmissionListItem[]>([]);
  const [pagination, setPagination] = useState<SubmissionPagination>({
    page: filters.page,
    limit: filters.limit,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await submissionService.list(filters);
      setItems(result.items);
      setPagination(result.pagination);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [filters.examId, filters.status, filters.page, filters.limit]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const stats = useMemo(() => {
    const pendingCount = items.filter((i) => i.gradingStatus === "PENDING_REVIEW").length;
    const gradedCount = items.filter((i) => i.gradingStatus === "FULLY_GRADED").length;
    const autoGradedCount = items.filter((i) => i.gradingStatus === "FULLY_AUTO_GRADED").length;
    return {
      totalSubmissions: pagination.total,
      pendingCount,
      gradedCount,
      autoGradedCount,
      /** Number of items the breakdown above is actually computed from (== items.length, i.e. this page/limit, not `total`). */
      sampleSize: items.length,
    };
  }, [items, pagination.total]);

  return { items, pagination, isLoading, stats, refetch: fetchSubmissions };
}
