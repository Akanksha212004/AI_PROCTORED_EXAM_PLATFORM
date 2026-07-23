"use client";

// hooks/useNotifications.ts
//
// NOTE: written as a self-contained fetch (using the same "access_token"
// cookie as useAuth.tsx) because I don't have your services/dashboardService.ts
// or shared apiClient yet. If you have a shared axios instance, swap the
// `authedFetch` calls below for that instead — same shape of data in/out.

import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const TOKEN_COOKIE = "access_token";

export type NotificationType = "question_added" | "exam_created" | "submission" | "graded";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  isUnread: boolean;
}

interface NotificationsResponse {
  items: NotificationItem[];
  unreadCount: number;
  seenAt: string | null;
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

  return res.status === 204 ? null : res.json();
}

export function useNotifications(limit = 15) {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const result = await authedFetch(`/examiner/notifications?limit=${limit}`, { signal });
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        toast.error(err instanceof Error ? err.message : "Could not load notifications");
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchNotifications(controller.signal);
    return () => controller.abort();
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    // Optimistic — flips everything to read immediately, no flash of stale state.
    setData((prev) =>
      prev ? { ...prev, unreadCount: 0, items: prev.items.map((i) => ({ ...i, isUnread: false })) } : prev
    );
    try {
      await authedFetch("/examiner/notifications/mark-read", { method: "POST" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not mark notifications as read");
      fetchNotifications(); // reconcile with server if the optimistic update was wrong
    }
  }, [fetchNotifications]);

  return {
    items: data?.items ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    markAllRead,
    refetch: fetchNotifications,
  };
}
