"use client";

// hooks/useReports.ts

import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const TOKEN_COOKIE = "access_token";

export type ExamReportStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export interface ExamReportRow {
  id: string;
  title: string;
  subject: string;
  status: ExamReportStatus;
  createdAt: string;
  attempts: number;
  averageScore: number | null;
  passRate: number | null;
}

export interface ExamReportDetailRow {
  studentName: string;
  studentEmail: string;
  status: string;
  marksObtained: number | null;
  maxMarks: number | null;
  percentage: number | null;
  submittedAt: string | null;
}

export interface ExamReportDetail {
  exam: { id: string; title: string; subject: string };
  rows: ExamReportDetailRow[];
  summary: { attempts: number; averageScore: number | null; passRate: number | null };
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

async function downloadFile(path: string, filename: string) {
  const token = Cookies.get(TOKEN_COOKIE);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Could not download report (${res.status})`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useReports() {
  const [items, setItems] = useState<ExamReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [viewDetail, setViewDetail] = useState<ExamReportDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchReports = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const result = await authedFetch("/examiner/reports/exams", { signal });
      setItems(result);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error(err instanceof Error ? err.message : "Could not load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchReports(controller.signal);
    return () => controller.abort();
  }, [fetchReports]);

  async function viewReport(examId: string) {
    setIsLoadingDetail(true);
    setViewDetail(null);
    try {
      const result = await authedFetch(`/examiner/reports/exams/${examId}`);
      setViewDetail(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load report");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  function closeReport() {
    setViewDetail(null);
  }

  function safeFileName(title: string) {
    return title.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  }

  async function downloadCsv(examId: string, examTitle: string) {
    setDownloadingId(`${examId}-csv`);
    try {
      await downloadFile(`/examiner/reports/exams/${examId}/export`, `${safeFileName(examTitle)}_report.csv`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download CSV");
    } finally {
      setDownloadingId(null);
    }
  }

  async function downloadPdf(examId: string, examTitle: string) {
    setDownloadingId(`${examId}-pdf`);
    try {
      await downloadFile(`/examiner/reports/exams/${examId}/export/pdf`, `${safeFileName(examTitle)}_report.pdf`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download PDF");
    } finally {
      setDownloadingId(null);
    }
  }

  return {
    items,
    isLoading,
    downloadingId,
    downloadCsv,
    downloadPdf,
    viewDetail,
    isLoadingDetail,
    viewReport,
    closeReport,
    refetch: fetchReports,
  };
}
