// "use client";

// // The backend has no dedicated stats endpoint, so this derives
// // dashboard numbers from the list endpoint:
// //   - Total Questions: a limit=1 unfiltered call, reading
// //     `pagination.total` (cheap, exact).
// //   - Subject Count / Difficulty Distribution / Recently Added:
// //     computed from up to the 100 most recent questions (the max
// //     `limit` the backend allows). If the bank has more than 100
// //     questions, this is a sample of the most recent ones, not the
// //     full set — flagged in the UI rather than silently wrong.

// import { useCallback, useEffect, useState } from "react";

// import { questionService } from "@/services/questionService";
// import type { Question } from "@/types/question";

// export interface QuestionStats {
//   totalQuestions: number;
//   subjectCount: number;
//   difficultyDistribution: Record<"EASY" | "MEDIUM" | "HARD", number>;
//   recentQuestions: Question[];
//   isSampled: boolean; // true if totalQuestions > 100 (stats are from a sample)
// }

// const SAMPLE_SIZE = 100;
// const RECENT_COUNT = 5;

// export function useQuestionStats() {
//   const [stats, setStats] = useState<QuestionStats | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchStats = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const sample = await questionService.list({ page: 1, limit: SAMPLE_SIZE });

//       const subjectSet = new Set(sample.items.map((q) => q.subject));
//       const difficultyDistribution = { EASY: 0, MEDIUM: 0, HARD: 0 } as Record<
//         "EASY" | "MEDIUM" | "HARD",
//         number
//       >;
//       sample.items.forEach((q) => {
//         difficultyDistribution[q.difficultyLevel] += 1;
//       });

//       setStats({
//         totalQuestions: sample.pagination.total,
//         subjectCount: subjectSet.size,
//         difficultyDistribution,
//         recentQuestions: sample.items.slice(0, RECENT_COUNT),
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

// hooks/useQuestionStats.ts
//
// The backend has no dedicated stats endpoint, so this derives
// dashboard numbers from the list endpoint:
//   - Total Questions: a limit=1 unfiltered call, reading
//     `pagination.total` (cheap, exact).
//   - Subject Count / Difficulty Distribution / Recently Added:
//     computed from up to the 100 most recent questions (the max
//     `limit` the backend allows). If the bank has more than 100
//     questions, this is a sample of the most recent ones, not the
//     full set — flagged in the UI rather than silently wrong.

import { useCallback, useEffect, useState } from "react";

import { questionService } from "@/services/questionService";
import type { Question } from "@/types/question";

export interface QuestionStats {
    totalQuestions: number;
    subjectCount: number;
    difficultyDistribution: Record<"EASY" | "MEDIUM" | "HARD", number>;
    recentQuestions: Question[];
    subjects: string[]; // sorted unique subject names from the sample, for filter dropdowns
    isSampled: boolean; // true if totalQuestions > 100 (stats are from a sample)
}

const SAMPLE_SIZE = 100;
const RECENT_COUNT = 5;

export function useQuestionStats() {
    const [stats, setStats] = useState<QuestionStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const sample = await questionService.list({ page: 1, limit: SAMPLE_SIZE });

            const subjectSet = new Set(sample.items.map((q) => q.subject));
            const difficultyDistribution = {
                EASY: 0,
                MEDIUM: 0,
                HARD: 0,
            } as Record<"EASY" | "MEDIUM" | "HARD", number>;
            sample.items.forEach((q) => {
                difficultyDistribution[q.difficultyLevel] += 1;
            });

            const subjects = Array.from(subjectSet).sort();

            setStats({
                totalQuestions: sample.pagination.total,
                subjectCount: subjectSet.size,
                difficultyDistribution,
                recentQuestions: sample.items.slice(0, RECENT_COUNT),
                subjects,
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