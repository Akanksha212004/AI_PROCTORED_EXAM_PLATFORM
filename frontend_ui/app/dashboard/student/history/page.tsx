"use client";

// app/dashboard/student/history/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronLeft as ArrowBack, Loader2, FileText } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useExamHistory } from "@/hooks/useExamHistory";
import type { GradingStatus, SessionStatus } from "@/types/examSession";
import { cn } from "@/lib/utils";

export default function ExamHistoryPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <DashboardShell>
        <ExamHistoryContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function statusLabel(status: SessionStatus): string {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "SUBMITTED":
      return "Submitted";
    case "AUTO_SUBMITTED":
      return "Auto-submitted";
    case "EXPIRED":
      return "Expired";
    default:
      return status;
  }
}

function gradingBadgeTone(status: GradingStatus): "neutral" | "sky" {
  return status === "PENDING_REVIEW" ? "neutral" : "sky";
}

function gradingLabel(status: GradingStatus): string {
  switch (status) {
    case "FULLY_AUTO_GRADED":
    case "FULLY_GRADED":
      return "Graded";
    case "PENDING_REVIEW":
      return "Pending Review";
    default:
      return status;
  }
}

function ExamHistoryContent() {
  const router = useRouter();
  const { items, page, totalPages, total, isLoading, nextPage, prevPage } = useExamHistory();

  return (
    <div className="space-y-6 pb-4">
      <button
        onClick={() => router.push("/dashboard/student")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-paper/60 transition-colors hover:text-paper"
      >
        <ArrowBack className="h-4 w-4" /> Back to Dashboard
      </button>

      <div>
        <p className="mb-1.5 font-mono text-xs uppercase tracking-[0.2em] text-accent-teal">
          Exam History
        </p>
        <h1 className="font-display text-3xl font-semibold text-paper">All Submissions</h1>
        <p className="mt-2 text-sm text-paper/60">
          {total > 0 ? `${total} exam${total === 1 ? "" : "s"} submitted` : "Your past exam submissions"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-paper/60">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading history...
        </div>
      ) : items.length === 0 ? (
        <Card className="p-6 text-sm text-paper/70">You haven&apos;t submitted any exams yet.</Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:border-accent-teal/40"
            >
              <div className="min-w-[200px]">
                <p className="font-display text-lg font-semibold text-paper">{item.examTitle}</p>
                <p className="mt-0.5 text-sm text-paper/50">{item.examSubject}</p>
              </div>

              <div className="text-sm text-paper/60">
                {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "—"}
              </div>

              <div className="text-sm font-medium text-paper/80">
                {item.gradingStatus === "PENDING_REVIEW" ? "—" : `${item.totalMarks} / ${item.maxMarks}`}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone="neutral">{statusLabel(item.status)}</Badge>
                <Badge tone={gradingBadgeTone(item.gradingStatus)}>{gradingLabel(item.gradingStatus)}</Badge>
              </div>

              <button
                onClick={() => router.push(`/dashboard/student/report/${item.id}`)}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium text-accent-sky underline",
                  "transition-opacity hover:opacity-80"
                )}
              >
                <FileText className="h-4 w-4" /> View Report
              </button>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm text-paper/70">
          <button
            onClick={prevPage}
            disabled={page <= 1 || isLoading}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={page >= totalPages || isLoading}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}