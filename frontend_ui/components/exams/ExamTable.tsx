"use client";

import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/hooks/useI18n";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import type { Exam, ExamPagination, ExamStatus } from "@/types/exam";

interface Props {
  exams: Exam[];
  isLoading: boolean;
  pagination?: ExamPagination;
  /** Shows a "Created By" column with the examiner's name. Off by default —
   *  only the admin's platform-wide exams page opts in, since an examiner
   *  viewing their own list doesn't need to be told who made each exam. */
  showCreator?: boolean;
  onView: (e: Exam) => void;
  onEdit: (e: Exam) => void;
  onDelete: (e: Exam) => void;
}

function lifecycleTone(status: ExamStatus): "amber" | "teal" | "rose" {
  if (status === "PUBLISHED") return "teal";
  if (status === "CANCELLED") return "rose";
  return "amber"; // DRAFT
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return { date: d.toLocaleDateString(), time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
}

export function ExamTable({ exams, isLoading, pagination, showCreator = false, onView, onEdit, onDelete }: Props) {
  const { t } = useI18n();

  // Dynamic (examiner-authored) content — exam title + subject — same
  // machine-translation mechanism used for question text. Table chrome
  // (headers, buttons, computed status labels) below is static UI text
  // translated via t(). Note: exam.status itself is a Prisma ExamStatus
  // enum (DRAFT/PUBLISHED/CANCELLED) — enum values are never translated,
  // so it's rendered as-is further down.
  const flatTexts = exams.flatMap((e) => [e.title, e.subject]);
  const { translated } = useTranslatedTexts(flatTexts);

  function timeWindowStatus(exam: Exam): { label: string; tone: "sky" | "teal" | "neutral" | "rose" } {
    const now = Date.now();
    const start = new Date(exam.startTime).getTime();
    const end = new Date(exam.endTime).getTime();
    if (now < start) return { label: t("exams.table.windowUpcoming"), tone: "sky" };
    if (now >= start && now <= end) return { label: t("exams.table.windowActive"), tone: "teal" };
    return { label: t("exams.table.windowEnded"), tone: "neutral" };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {t("exams.table.loading")}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-display text-lg text-paper">{t("exams.table.empty")}</p>
        <p className="max-w-sm text-sm text-muted">{t("exams.table.emptyHint")}</p>
      </div>
    );
  }

  const rowOffset = pagination ? (pagination.page - 1) * pagination.limit : 0;

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${showCreator ? "min-w-[1200px]" : "min-w-[1080px]"}`}>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="py-3 pr-4 font-medium">{t("exams.table.sno")}</th>
            <th className="py-3 pr-4 font-medium">{t("exams.table.title")}</th>
            <th className="py-3 pr-4 font-medium">{t("exams.table.subject")}</th>
            {showCreator && <th className="py-3 pr-4 font-medium">{t("exams.table.createdBy")}</th>}
            <th className="py-3 pr-4 font-medium">{t("exams.table.duration")}</th>
            <th className="py-3 pr-4 font-medium">{t("exams.table.marks")}</th>
            <th className="py-3 pr-4 font-medium">{t("exams.table.window")}</th>
            <th className="py-3 pr-4 font-medium">{t("exams.table.status")}</th>
            <th className="py-3 pr-4 font-medium">{t("exams.table.questions")}</th>
            <th className="py-3 pr-2 text-right font-medium">{t("exams.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam, i) => {
            const timeStatus = timeWindowStatus(exam);
            const start = formatDateTime(exam.startTime);
            const end = formatDateTime(exam.endTime);
            const questionCount =
              exam.examQuestions.length > 0
                ? `${exam.examQuestions.length} ${t("exams.table.curatedSuffix")}`
                : exam.selectionRules.length > 0
                ? `${exam.selectionRules.reduce((sum, r) => sum + r.count, 0)} ${t("exams.table.viaRulesSuffix")}`
                : t("exams.table.notConfigured");

            const translatedTitle = translated[i * 2] ?? exam.title;
            const translatedSubject = translated[i * 2 + 1] ?? exam.subject;

            return (
              <tr key={exam.id} className="border-b border-border/60 hover:bg-white/[0.03]">
                <td className="py-3.5 pr-4 text-muted">{rowOffset + i + 1}</td>
                <td className="py-3.5 pr-4 text-paper">{translatedTitle}</td>
                <td className="py-3.5 pr-4 text-muted">{translatedSubject}</td>
                {showCreator && (
                  <td className="py-3.5 pr-4 text-muted">{exam.createdBy?.name ?? "—"}</td>
                )}
                <td className="py-3.5 pr-4 text-muted">
                  {exam.durationMinutes} {t("exams.table.minutesSuffix")}
                </td>
                <td className="py-3.5 pr-4 text-muted">
                  {exam.totalMarks}{" "}
                  <span className="text-xs text-muted/70">
                    ({t("exams.table.passPrefix")} {exam.passingMarks})
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-muted">
                  <div className="flex flex-col text-xs">
                    <span>
                      {start.date} {start.time}
                    </span>
                    <span className="text-muted/70">
                      {t("exams.table.to")} {end.date} {end.time}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {/* exam.status is a Prisma enum (DRAFT/PUBLISHED/CANCELLED) — shown via the
                        pre-built examStatus.* static labels, never machine-translated */}
                    <Badge tone={lifecycleTone(exam.status)}>{t(`examStatus.${exam.status}`)}</Badge>
                    <Badge tone={timeStatus.tone}>{timeStatus.label}</Badge>
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-muted">{questionCount}</td>
                <td className="py-3.5 pr-2">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onView(exam)}
                      aria-label={t("exams.table.viewAction")}
                      className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(exam)}
                      aria-label={t("exams.table.editAction")}
                      className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(exam)}
                      aria-label={t("exams.table.deleteAction")}
                      className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-rose"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
