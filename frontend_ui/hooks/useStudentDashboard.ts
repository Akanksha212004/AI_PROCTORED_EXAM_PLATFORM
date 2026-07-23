// "use client";

// // hooks/useStudentDashboard.ts
// //
// // Drives the Student Dashboard. Everything here is derived from the
// // existing `GET /exams/available` endpoint (via examSessionService) —
// // there is still no student-scoped summary endpoint. When one ships,
// // only the body of `fetchDashboard` changes to call it instead; the
// // shape returned to the page (todaysExams, upcomingExams, stats)
// // stays stable, so nothing downstream needs to be redesigned.

// import { useCallback, useEffect, useState } from "react";
// import toast from "react-hot-toast";

// import { examSessionService } from "@/services/examSessionService";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import type { AvailableExam } from "@/types/examSession";

// export type ExamAvailability = "live" | "upcoming" | "closed";

// export interface StudentExamCardData extends AvailableExam {
//   availability: ExamAvailability;
// }

// export interface StudentDashboardStats {
//   liveCount: number;
//   todayCount: number;
//   upcomingCount: number;
// }

// function isSameDay(a: Date, b: Date): boolean {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

// function deriveAvailability(exam: AvailableExam, now: number): ExamAvailability {
//   const start = new Date(exam.startTime).getTime();
//   const end = new Date(exam.endTime).getTime();
//   if (now >= start && now <= end) return "live";
//   if (now < start) return "upcoming";
//   return "closed";
// }

// export function useStudentDashboard() {
//   const [exams, setExams] = useState<AvailableExam[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchDashboard = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const data = await examSessionService.listAvailable();
//       setExams(data);
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboard();
//   }, [fetchDashboard]);

//   const now = Date.now();
//   const today = new Date();

//   const withAvailability: StudentExamCardData[] = exams.map((exam) => ({
//     ...exam,
//     availability: deriveAvailability(exam, now),
//   }));

//   const todaysExams = withAvailability
//     .filter(
//       (exam) => exam.availability === "live" || isSameDay(new Date(exam.startTime), today)
//     )
//     .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

//   const upcomingExams = withAvailability
//     .filter(
//       (exam) => exam.availability === "upcoming" && !isSameDay(new Date(exam.startTime), today)
//     )
//     .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

//   const stats: StudentDashboardStats = {
//     liveCount: withAvailability.filter((e) => e.availability === "live").length,
//     todayCount: todaysExams.length,
//     upcomingCount: withAvailability.filter((e) => e.availability === "upcoming").length,
//   };

//   return {
//     isLoading,
//     todaysExams,
//     upcomingExams,
//     stats,
//     refetch: fetchDashboard,
//   };
// }






"use client";

// hooks/useStudentDashboard.ts

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { examSessionService } from "@/services/examSessionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { AvailableExam, MySubmissionListItem } from "@/types/examSession";

export type ExamAvailability = "live" | "upcoming" | "closed";

export interface StudentExamCardData extends AvailableExam {
  availability: ExamAvailability;
}

export interface StudentDashboardStats {
  liveCount: number;
  todayCount: number;
  upcomingCount: number;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function deriveAvailability(exam: AvailableExam, now: number): ExamAvailability {
  const start = new Date(exam.startTime).getTime();
  const end = new Date(exam.endTime).getTime();
  if (now >= start && now <= end) return "live";
  if (now < start) return "upcoming";
  return "closed";
}

const RECENT_RESULTS_COUNT = 3;

export function useStudentDashboard() {
  const [exams, setExams] = useState<AvailableExam[]>([]);
  const [submissions, setSubmissions] = useState<MySubmissionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await examSessionService.listAvailable();
      setExams(data);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setIsLoadingSubmissions(true);
    try {
      const data = await examSessionService.listMine(1, 20);
      setSubmissions(data.items);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchSubmissions();
  }, [fetchDashboard, fetchSubmissions]);

  const now = Date.now();
  const today = new Date();

  const withAvailability: StudentExamCardData[] = exams.map((exam) => ({
    ...exam,
    availability: deriveAvailability(exam, now),
  }));

  const todaysExams = withAvailability
    .filter(
      (exam) => exam.availability === "live" || isSameDay(new Date(exam.startTime), today)
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const upcomingExams = withAvailability
    .filter(
      (exam) => exam.availability === "upcoming" && !isSameDay(new Date(exam.startTime), today)
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const stats: StudentDashboardStats = {
    liveCount: withAvailability.filter((e) => e.availability === "live").length,
    todayCount: todaysExams.length,
    upcomingCount: withAvailability.filter((e) => e.availability === "upcoming").length,
  };

  const examHistory = [...submissions].sort(
    (a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime()
  );

  const recentResults = examHistory
    .filter((s) => s.gradingStatus === "FULLY_AUTO_GRADED" || s.gradingStatus === "FULLY_GRADED")
    .slice(0, RECENT_RESULTS_COUNT);

  return {
    isLoading,
    isLoadingSubmissions,
    todaysExams,
    upcomingExams,
    stats,
    examHistory,
    recentResults,
    refetch: fetchDashboard,
  };
}