"use client";

// hooks/useLiveSessions.ts
//
// Polls every 10s — see proctorEvent.routes.ts header comment for why
// this is polling rather than a WebSocket push.

import { useCallback, useEffect, useState } from "react";

import { proctorEventService } from "@/services/proctorEventService";
import type { LiveSessionItem } from "@/types/proctorEvent";

const POLL_INTERVAL_MS = 10000;

export function useLiveSessions() {
  const [sessions, setSessions] = useState<LiveSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await proctorEventService.getLiveSessions();
      setSessions(data);
    } catch {
      // Silent on poll failures — don't spam toasts every 10s on a flaky connection.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  return { sessions, isLoading, refetch: fetchSessions };
}
