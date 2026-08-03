"use client";

import { Eye, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/hooks/useI18n";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import type { SubmissionListItem } from "@/types/submission";

interface Props {
  submissions: SubmissionListItem[];
  isLoading: boolean;
  /** Shows an "Examiner" column with who created the exam. Off by default —
   *  only the admin's platform-wide submissions page opts in. */
  showExaminer?: boolean;
  onReview: (s: SubmissionListItem) => void;
}

function statusTone(status: string): "sky" | "amber" | "teal" {
  if (status === "FULLY_GRADED") return "teal";
  if (status === "PENDING_REVIEW") return "amber";
  return "sky"; // FULLY_AUTO_GRADED
}

export function SubmissionsTable({ submissions, isLoading, showExaminer = false, onReview }: Props) {
  const { t } = useI18n();

  function statusLabel(status: string): string {
    if (status === "FULLY_GRADED") return t("submissions.table.statusGraded");
    if (status === "PENDING_REVIEW") return t("submissions.table.statusNeedsReview");
    return t("submissions.table.statusAutoGraded"); // FULLY_AUTO_GRADED
  }

  // Dynamic (examiner-authored) content — exam title + subject, shown
  // per submission row. Student name/email is not translated (not
  // examiner prose); status labels above are static UI text via t().
  const flatTexts = submissions.flatMap((s) => [s.examTitle, s.examSubject]);
  const { translated } = useTranslatedTexts(flatTexts);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("submissions.table.loading")}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-display text-lg text-paper">{t("submissions.table.empty")}</p>
        <p className="max-w-sm text-sm text-muted">{t("submissions.table.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${showExaminer ? "min-w-[980px]" : "min-w-[860px]"}`}>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="py-3 pr-4 font-medium">{t("submissions.table.student")}</th>
            <th className="py-3 pr-4 font-medium">{t("submissions.table.exam")}</th>
            {showExaminer && <th className="py-3 pr-4 font-medium">{t("submissions.table.examiner")}</th>}
            <th className="py-3 pr-4 font-medium">{t("submissions.table.submitted")}</th>
            <th className="py-3 pr-4 font-medium">{t("submissions.table.autoScore")}</th>
            <th className="py-3 pr-4 font-medium">{t("submissions.table.status")}</th>
            <th className="py-3 pr-2 text-right font-medium">{t("submissions.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, i) => {
            const translatedExamTitle = translated[i * 2] ?? s.examTitle;
            const translatedExamSubject = translated[i * 2 + 1] ?? s.examSubject;

            return (
              <tr key={s.id} className="border-b border-border/60 hover:bg-white/[0.03]">
                <td className="py-3.5 pr-4">
                  <p className="text-paper">{s.studentName}</p>
                  <p className="text-xs text-muted">{s.studentEmail}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="text-paper">{translatedExamTitle}</p>
                  <p className="text-xs text-muted">{translatedExamSubject}</p>
                </td>
                {showExaminer && (
                  <td className="py-3.5 pr-4 text-muted">{s.examinerName ?? "—"}</td>
                )}
                <td className="py-3.5 pr-4 text-muted">
                  {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                </td>
                <td className="py-3.5 pr-4 text-paper">{s.autoGradedMarks}</td>
                <td className="py-3.5 pr-4">
                  <Badge tone={statusTone(s.gradingStatus)}>
                    {statusLabel(s.gradingStatus)}
                    {s.gradingStatus === "PENDING_REVIEW" ? ` (${s.pendingCount})` : ""}
                  </Badge>
                </td>
                <td className="py-3.5 pr-2 text-right">
                  <button
                    onClick={() => onReview(s)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-accent-sky hover:bg-white/5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {s.gradingStatus === "PENDING_REVIEW" ? t("submissions.table.grade") : t("submissions.table.view")}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
