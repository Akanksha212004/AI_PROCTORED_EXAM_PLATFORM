"use client";

// app/dashboard/student/report/[sessionId]/page.tsx

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, ChevronLeft, Loader2, FileText } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { examSessionService } from "@/services/examSessionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import { STATIC_FILE_ORIGIN } from "@/lib/axios";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import type { SubmissionReport, ReportQuestion } from "@/types/examSession";
import { cn } from "@/lib/utils";

export default function StudentReportPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <DashboardShell>
        <StudentReportContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function StudentReportContent() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<SubmissionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await examSessionService.getReport(params.sessionId);
        if (!cancelled) setReport(data);
      } catch (err) {
        const message = extractExamErrorMessage(err);
        if (!cancelled) setLoadError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.sessionId]);

  // Dynamic (examiner-authored) content — the exam title. Called
  // unconditionally (before the isLoading/error early returns below)
  // with an empty array until `report` is available, since hooks can't
  // be called conditionally.
  const { translated: translatedReportMeta } = useTranslatedTexts(report ? [report.examTitle] : []);
  const translatedExamTitle = report ? translatedReportMeta[0] ?? report.examTitle : "";

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading report...
      </div>
    );
  }

  if (loadError || !report) {
    return (
      <div className="space-y-4">
        <BackLink onClick={() => router.push("/dashboard/student")} />
        <Card className="p-6 text-sm text-paper/70">
          {loadError ?? "This report is not available."}
        </Card>
      </div>
    );
  }

  const pendingCount = report.questions.filter((q) => q.grading?.status === "PENDING").length;

  return (
    <div className="space-y-8 pb-4">
      <BackLink onClick={() => router.push("/dashboard/student")} />

      <div>
        <p className="mb-1.5 font-mono text-xs uppercase tracking-[0.2em] text-accent-teal">
          Exam Report
        </p>
        <h1 className="font-display text-3xl font-semibold text-paper">{translatedExamTitle}</h1>
        <p className="mt-2 text-sm text-paper/60">
          Submitted {report.submittedAt ? new Date(report.submittedAt).toLocaleString() : "—"}
        </p>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-paper/40">Total marks</p>
          <p className="font-display text-3xl font-semibold text-paper">{report.totalMarks}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">
            {report.status === "AUTO_SUBMITTED" ? "Auto-submitted" : "Submitted"}
          </Badge>
          {pendingCount > 0 && (
            <Badge tone="neutral">{pendingCount} awaiting examiner review</Badge>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {report.questions.map((q, i) => (
          <QuestionReportCard key={q.questionId} question={q} index={i} />
        ))}
      </div>
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-paper/60 transition-colors hover:text-paper"
    >
      <ChevronLeft className="h-4 w-4" /> Back to Dashboard
    </button>
  );
}

function QuestionReportCard({ question, index }: { question: ReportQuestion; index: number }) {
  const isPending = question.grading?.status === "PENDING";
  const isGraded = question.grading?.status === "GRADED" || question.grading?.status === "AI_GRADED";

  let isCorrect: boolean | null = null;
  if (question.isObjective && question.options) {
    const correctIds = new Set(question.options.filter((o) => o.isCorrect).map((o) => o.id));
    const selectedIds = new Set(question.selectedOptionIds);
    isCorrect =
      correctIds.size === selectedIds.size && [...correctIds].every((id) => selectedIds.has(id));
  }

  // Dynamic content — question text, option text, and (unlike the
  // examiner's GradingDialog, where feedback is an editable input) the
  // examiner's feedback here is read-only for the student, so it's
  // translated too: this is exactly the kind of text a student most
  // needs in their own language.
  // Layout: [questionText, ...optionTexts, feedback?]
  const optionTexts = question.options?.map((o) => o.optionText) ?? [];
  const feedback = question.grading?.feedback;
  const dynamicTexts = [question.questionText, ...optionTexts, ...(feedback ? [feedback] : [])];
  const { translated } = useTranslatedTexts(dynamicTexts);

  const translatedQuestionText = translated[0] ?? question.questionText;
  const translatedOptionTexts = translated.slice(1, 1 + optionTexts.length);
  const translatedFeedback = feedback ? translated[1 + optionTexts.length] ?? feedback : null;

  return (
    <Card className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">Question {index + 1}</Badge>
          <Badge tone="sky">{question.questionType.replace("_", " ")}</Badge>
          <Badge tone="neutral">{question.marksAllocated} marks</Badge>
        </div>

        {question.isObjective && isCorrect !== null && (
          <span
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              isCorrect ? "text-accent-teal" : "text-accent-rose"
            )}
          >
            {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {isCorrect ? "Correct" : "Incorrect"} · {question.marksAwarded ?? 0} marks
          </span>
        )}

        {!question.isObjective && (
          <span className="text-sm font-medium text-paper/70">
            {isPending
              ? "Awaiting review"
              : `${question.marksAwarded ?? 0} / ${question.marksAllocated} marks`}
          </span>
        )}
      </div>

      <p className="whitespace-pre-wrap text-paper">{translatedQuestionText}</p>

      {question.isObjective && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const wasSelected = question.selectedOptionIds.includes(opt.id);
            return (
              <div
                key={opt.id}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-sm",
                  opt.isCorrect
                    ? "border-accent-teal/50 bg-accent-teal/10 text-paper"
                    : wasSelected
                    ? "border-accent-rose/50 bg-accent-rose/10 text-paper"
                    : "border-border text-paper/70"
                )}
              >
                {translatedOptionTexts[i] ?? opt.optionText}
                {opt.isCorrect && <span className="ml-2 text-xs text-accent-teal">(correct answer)</span>}
                {wasSelected && !opt.isCorrect && (
                  <span className="ml-2 text-xs text-accent-rose">(your answer)</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!question.isObjective && question.submittedText && (
        <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm text-paper/85">
          {question.submittedText}
        </div>
      )}

      {!question.isObjective && question.submittedFileUrl && (
        <a
          href={`${STATIC_FILE_ORIGIN}${question.submittedFileUrl}`}
          target="_blank"
          rel="noreferrer"
          className="flex w-fit items-center gap-2 text-sm text-accent-sky underline"
        >
          <FileText className="h-4 w-4" /> View uploaded answer
        </a>
      )}

      {!question.isObjective && !question.submittedText && !question.submittedFileUrl && (
        <p className="text-sm italic text-paper/40">Not answered</p>
      )}

      {isGraded && translatedFeedback && (
        <div className="rounded-lg border border-accent-sky/30 bg-accent-sky/5 p-4 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-sky">
            Examiner feedback
          </p>
          <p className="text-paper/85">{translatedFeedback}</p>
        </div>
      )}
    </Card>
  );
}