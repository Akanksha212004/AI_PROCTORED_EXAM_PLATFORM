"use client";

// hooks/useAnalytics.ts

import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const TOKEN_COOKIE = "access_token";

export interface ScoreTrendPoint {
  weekStart: string;
  averageScore: number | null;
  attempts: number;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number | null;
  attempts: number;
}

export interface PassFailRate {
  passed: number;
  failed: number;
  total: number;
  passRate: number | null;
}

export interface ExamComparisonRow {
  examId: string;
  examTitle: string;
  subject: string;
  attempts: number;
  averageScore: number | null;
  passRate: number | null;
}

export interface AnalyticsData {
  scoreTrend: ScoreTrendPoint[];
  subjectPerformance: SubjectPerformance[];
  passFailRate: PassFailRate;
  examComparison: ExamComparisonRow[];
}

async function authedFetch(path: string, init?: RequestInit) {
  const token = Cookies.get(TOKEN_COOKIE);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export function useAnalytics(weeks = 8) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const result = await authedFetch(`/examiner/analytics?weeks=${weeks}&examLimit=10`, { signal });
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        toast.error(err instanceof Error ? err.message : "Could not load analytics");
      } finally {
        setIsLoading(false);
      }
    },
    [weeks]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAnalytics(controller.signal);
    return () => controller.abort();
  }, [fetchAnalytics]);

  return { data, isLoading, refetch: fetchAnalytics };
}
