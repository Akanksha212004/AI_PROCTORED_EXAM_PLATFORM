"use client";

// app/dashboard/student/history/page.tsx

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronLeft as ArrowBack, Loader2, FileText } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useExamHistory } from "@/hooks/useExamHistory";
import { useI18n } from "@/hooks/useI18n";
import type { GradingStatus, SessionStatus } from "@/types/examSession";
import { cn } from "@/lib/utils";

import { useAutoTranslate } from "@/hooks/useAutoTranslate";

function LocalizedText({ text }: { text: string }) {
  const translated = useAutoTranslate(text);
  return <>{translated}</>;
}

export default function ExamHistoryPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <DashboardShell>
        <ExamHistoryContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function statusLabelKey(status: SessionStatus): string | null {
  switch (status) {
    case "IN_PROGRESS":
      return "studentHistory.status.inProgress";
    case "SUBMITTED":
      return "studentHistory.status.submitted";
    case "AUTO_SUBMITTED":
      return "studentHistory.status.autoSubmitted";
    case "EXPIRED":
      return "studentHistory.status.expired";
    default:
      return null;
  }
}

function gradingBadgeTone(status: GradingStatus): "neutral" | "sky" {
  return status === "PENDING_REVIEW" ? "neutral" : "sky";
}

function gradingLabelKey(status: GradingStatus): string | null {
  switch (status) {
    case "FULLY_AUTO_GRADED":
    case "FULLY_GRADED":
      return "dashboard.student.examHistory.status.graded";
    case "PENDING_REVIEW":
      return "dashboard.student.examHistory.status.pendingReview";
    default:
      return null;
  }
}

function ExamHistoryContent() {
  const router = useRouter();
  const { t } = useI18n();
  const { items, page, totalPages, total, isLoading, nextPage, prevPage } = useExamHistory();

  return (
    <div className="space-y-6 pb-4">
      <button
        onClick={() => router.push("/dashboard/student")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-paper/60 transition-colors hover:text-paper"
      >
        <ArrowBack className="h-4 w-4" /> {t("common.backToDashboard")}
      </button>

      <div>
        <p className="mb-1.5 font-mono text-xs uppercase tracking-[0.2em] text-accent-teal">
          {t("studentHistory.eyebrow")}
        </p>
        <h1 className="font-display text-3xl font-semibold text-paper">{t("studentHistory.title")}</h1>
        <p className="mt-2 text-sm text-paper/60">
          {total > 0
            ? t(total === 1 ? "studentHistory.subtitleSingular" : "studentHistory.subtitlePlural", { count: total })
            : t("studentHistory.subtitleEmpty")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-paper/60">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("studentHistory.loading")}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-6 text-sm text-paper/70">{t("dashboard.student.examHistory.empty")}</Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:border-accent-teal/40"
            >
              <div className="min-w-[200px]">
                <p className="font-display text-lg font-semibold text-paper">
                  <LocalizedText text={item.examTitle} />
                </p>
                <p className="mt-0.5 text-sm text-paper/50">
                  <LocalizedText text={item.examSubject} />
                </p>
              </div>

              <div className="text-sm text-paper/60">
                {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "—"}
              </div>

              <div className="text-sm font-medium text-paper/80">
                {item.gradingStatus === "PENDING_REVIEW" ? "—" : `${item.totalMarks} / ${item.maxMarks}`}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone="neutral">{statusLabelKey(item.status) ? t(statusLabelKey(item.status)!) : item.status}</Badge>
                <Badge tone={gradingBadgeTone(item.gradingStatus)}>
                  {gradingLabelKey(item.gradingStatus) ? t(gradingLabelKey(item.gradingStatus)!) : item.gradingStatus}
                </Badge>
              </div>

              <button
                onClick={() => router.push(`/dashboard/student/report/${item.id}`)}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium text-accent-sky underline",
                  "transition-opacity hover:opacity-80"
                )}
              >
                <FileText className="h-4 w-4" /> {t("studentHistory.viewReport")}
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
            <ChevronLeft className="h-4 w-4" /> {t("studentHistory.pagination.previous")}
          </button>
          <span>{t("studentHistory.pagination.pageOf", { page, totalPages })}</span>
          <button
            onClick={nextPage}
            disabled={page >= totalPages || isLoading}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 disabled:opacity-30"
          >
            {t("studentHistory.pagination.next")} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}