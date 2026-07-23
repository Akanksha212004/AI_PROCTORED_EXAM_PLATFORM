"use client";

// hooks/useStudentDetail.ts

import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const TOKEN_COOKIE = "access_token";

export type SessionStatus = "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED" | "EXPIRED";

export interface ExamHistoryItem {
  sessionId: string;
  examId: string;
  examTitle: string;
  subject: string;
  status: SessionStatus;
  startTime: string;
  endTime: string | null;
  score: number | null;
  totalMarks: number | null;
  maxMarks: number | null;
}

export interface StudentDetail {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  joinedAt: string;
  examsTaken: number;
  averageScore: number | null;
  lastActive: string | null;
  examHistory: ExamHistoryItem[];
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

export function useStudentDetail(studentId: string) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchStudent = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const result = await authedFetch(`/examiner/students/${studentId}`, { signal });
        setStudent(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Could not load student";
        if (message.toLowerCase().includes("not found")) {
          setNotFound(true);
        } else {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [studentId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchStudent(controller.signal);
    return () => controller.abort();
  }, [fetchStudent]);

  return { student, isLoading, notFound, refetch: fetchStudent };
}
