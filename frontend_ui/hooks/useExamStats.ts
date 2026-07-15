// "use client";

// // hooks/useExamStats.ts
// //
// // Same trade-off as useQuestionStats: no dedicated stats endpoint, so
// // this derives numbers from a sample fetch (up to the max limit of
// // 100). totalExams uses a separate limit=1 call for an exact count.

// import { useCallback, useEffect, useState } from "react";

// import { examService } from "@/services/examService";
// import type { Exam } from "@/types/exam";

// export interface ExamStats {
//   totalExams: number;
//   upcomingCount: number;
//   activeNowCount: number;
//   subjects: string[];
//   recentExams: Exam[];
//   isSampled: boolean;
// }

// const SAMPLE_SIZE = 100;
// const RECENT_COUNT = 5;

// export function useExamStats() {
//   const [stats, setStats] = useState<ExamStats | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchStats = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const sample = await examService.list({ page: 1, limit: SAMPLE_SIZE });
//       const now = Date.now();

//       let upcomingCount = 0;
//       let activeNowCount = 0;
//       sample.items.forEach((exam) => {
//         const start = new Date(exam.startTime).getTime();
//         const end = new Date(exam.endTime).getTime();
//         if (start > now) upcomingCount += 1;
//         else if (start <= now && now <= end) activeNowCount += 1;
//       });

//       setStats({
//         totalExams: sample.pagination.total,
//         upcomingCount,
//         activeNowCount,
//         subjects: Array.from(new Set(sample.items.map((e) => e.subject))).sort(),
//         recentExams: sample.items.slice(0, RECENT_COUNT),
//         isSampled: sample.pagination.total > SAMPLE_SIZE,
//       });
//     } catch {
//       setStats(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);

//   return { stats, isLoading, refetchStats: fetchStats };
// }







// "use client";
 
// // hooks/useExamStats.ts
// //
// // Same trade-off as useQuestionStats: no dedicated stats endpoint, so
// // this derives numbers from a sample fetch (up to the max limit of
// // 100). totalExams uses a separate limit=1 call for an exact count.
// //
// // subjectCounts was added for the dashboard's subject-distribution
// // chart — it's derived from the same sample response, no extra request.
 
// import { useCallback, useEffect, useState } from "react";
 
// import { examService } from "@/services/examService";
// import type { Exam } from "@/types/exam";
 
// export interface SubjectCount {
//   subject: string;
//   count: number;
// }
 
// export interface ExamStats {
//   totalExams: number;
//   upcomingCount: number;
//   activeNowCount: number;
//   subjects: string[];
//   subjectCounts: SubjectCount[];
//   recentExams: Exam[];
//   isSampled: boolean;
// }
 
// const SAMPLE_SIZE = 100;
// const RECENT_COUNT = 5;
 
// export function useExamStats() {
//   const [stats, setStats] = useState<ExamStats | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
 
//   const fetchStats = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const sample = await examService.list({ page: 1, limit: SAMPLE_SIZE });
//       const now = Date.now();
 
//       let upcomingCount = 0;
//       let activeNowCount = 0;
//       const subjectTally = new Map<string, number>();
 
//       sample.items.forEach((exam) => {
//         const start = new Date(exam.startTime).getTime();
//         const end = new Date(exam.endTime).getTime();
//         if (start > now) upcomingCount += 1;
//         else if (start <= now && now <= end) activeNowCount += 1;
 
//         subjectTally.set(exam.subject, (subjectTally.get(exam.subject) ?? 0) + 1);
//       });
 
//       const subjectCounts = Array.from(subjectTally.entries())
//         .map(([subject, count]) => ({ subject, count }))
//         .sort((a, b) => b.count - a.count);
 
//       setStats({
//         totalExams: sample.pagination.total,
//         upcomingCount,
//         activeNowCount,
//         subjects: subjectCounts.map((s) => s.subject),
//         subjectCounts,
//         recentExams: sample.items.slice(0, RECENT_COUNT),
//         isSampled: sample.pagination.total > SAMPLE_SIZE,
//       });
//     } catch {
//       setStats(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);
 
//   useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);
 
//   return { stats, isLoading, refetchStats: fetchStats };
// }




"use client";

// hooks/useExamStats.ts
//
// Same trade-off as useQuestionStats: no dedicated stats endpoint, so
// this derives numbers from a sample fetch (up to the max limit of
// 100). totalExams uses a separate limit=1 call for an exact count.
//
// subjectCounts was added for the dashboard's subject-distribution
// chart — it's derived from the same sample response, no extra request.

import { useCallback, useEffect, useState } from "react";

import { examService } from "@/services/examService";
import type { Exam } from "@/types/exam";

export interface SubjectCount {
  subject: string;
  count: number;
}

export interface ExamStats {
  totalExams: number;
  upcomingCount: number;
  activeNowCount: number;
  subjects: string[];
  subjectCounts: SubjectCount[];
  recentExams: Exam[];
  isSampled: boolean;
}

const SAMPLE_SIZE = 100;
const RECENT_COUNT = 5;

export function useExamStats() {
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const sample = await examService.list({ page: 1, limit: SAMPLE_SIZE });
      const now = Date.now();

      let upcomingCount = 0;
      let activeNowCount = 0;
      const subjectTally = new Map<string, number>();

      sample.items.forEach((exam) => {
        const start = new Date(exam.startTime).getTime();
        const end = new Date(exam.endTime).getTime();
        if (start > now) upcomingCount += 1;
        else if (start <= now && now <= end) activeNowCount += 1;

        subjectTally.set(exam.subject, (subjectTally.get(exam.subject) ?? 0) + 1);
      });

      const subjectCounts = Array.from(subjectTally.entries())
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalExams: sample.pagination.total,
        upcomingCount,
        activeNowCount,
        subjects: subjectCounts.map((s) => s.subject),
        subjectCounts,
        recentExams: sample.items.slice(0, RECENT_COUNT),
        isSampled: sample.pagination.total > SAMPLE_SIZE,
      });
    } catch {
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetchStats: fetchStats };
}
