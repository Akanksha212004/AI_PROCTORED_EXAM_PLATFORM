"use client";

// hooks/useStudents.ts

import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const TOKEN_COOKIE = "access_token";

export interface StudentListItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  joinedAt: string;
  examsTaken: number;
  averageScore: number | null;
  lastActive: string | null;
}

interface StudentsResponse {
  items: StudentListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export function useStudents(search: string, page: number, limit = 10) {
  const [data, setData] = useState<StudentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search.trim()) params.set("search", search.trim());
        const result = await authedFetch(`/examiner/students?${params.toString()}`, { signal });
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        toast.error(err instanceof Error ? err.message : "Could not load students");
      } finally {
        setIsLoading(false);
      }
    },
    [search, page, limit]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchStudents(controller.signal);
    return () => controller.abort();
  }, [fetchStudents]);

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    refetch: fetchStudents,
  };
}
