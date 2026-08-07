"use client";

import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";

import { Badge, difficultyTone, questionTypeLabel } from "@/components/ui/Badge";
import { useI18n } from "@/hooks/useI18n";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import type { Question } from "@/types/question";

interface Props {
  questions: Question[];
  isLoading: boolean;
  /** Optional — used only for S.NO. row numbering across pages. Not
   * required; passing it fixes the "Property 'pagination' does not
   * exist" TS error if your page.tsx already passes it in. */
  page: number;
  limit: number;
  onView: (q: Question) => void;
  onEdit: (q: Question) => void;
  onDelete: (q: Question) => void;
}

function LocalizedText({ text }: { text: string }) {
  const translated = useAutoTranslate(text);
  return <>{translated}</>;
}

function truncate(text: string, max = 70) {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export function QuestionTable({ questions, isLoading, page, limit, onView, onEdit, onDelete }: Props) {
  const { t } = useI18n();

  // Dynamic (examiner-authored) content — question text + subject —
  // machine-translated the same way as during exam-taking (see
  // QuestionPanel.tsx). Table chrome (headers, badges, buttons) below
  // is static UI text, translated via t() from the pre-built
  // lib/i18n/translations dictionaries instead.
  // Flattened to one array so a single batch request covers the whole
  // page instead of one request per row.

  // const flatTexts = questions.flatMap((q) => [q.questionText, q.subject]);
  // const { translated } = useTranslatedTexts(flatTexts);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {t("questions.table.loading")}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-display text-lg text-paper">{t("questions.table.empty")}</p>
        <p className="max-w-sm text-sm text-muted">{t("questions.table.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm sm:min-w-[980px]">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="py-3 pr-4 font-medium">{t("questions.table.sno")}</th>
            <th className="py-3 pr-4 font-medium">{t("questions.table.question")}</th>
            <th className="hidden py-3 pr-4 font-medium sm:table-cell">{t("questions.table.subject")}</th>
            <th className="hidden py-3 pr-4 font-medium md:table-cell">{t("questions.table.type")}</th>
            <th className="hidden py-3 pr-4 font-medium md:table-cell">{t("questions.table.difficulty")}</th>
            <th className="hidden py-3 pr-4 font-medium lg:table-cell">{t("questions.table.marks")}</th>
            <th className="hidden py-3 pr-4 font-medium lg:table-cell">{t("questions.table.negMarks")}</th>
            <th className="hidden py-3 pr-4 font-medium lg:table-cell">{t("questions.table.created")}</th>
            <th className="hidden py-3 pr-4 font-medium lg:table-cell">{t("questions.table.modified")}</th>
            <th className="py-3 pr-2 text-right font-medium">{t("questions.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, index) => {
            // const translatedQuestionText = translated[index * 2] ?? q.questionText;
            // const translatedSubject = translated[index * 2 + 1] ?? q.subject;

            return (
              <tr key={q.id} className="border-b border-border/60 hover:bg-white/[0.03]">
                <td className="py-3.5 pr-4 text-muted">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="max-w-[260px] py-3.5 pr-4 text-paper">
                  {/* <span className="block truncate sm:whitespace-normal sm:break-words">{truncate(translatedQuestionText)}</span> */}
                  <span className="block truncate sm:whitespace-normal sm:break-words">
                    <LocalizedText text={truncate(q.questionText)} />
                  </span>

                  {/* <span className="mt-0.5 block text-xs text-muted sm:hidden">{translatedSubject}</span> */}
                  <span className="mt-0.5 block text-xs text-muted sm:hidden">
                    <LocalizedText text={q.subject} />
                  </span>
                </td>
                {/* <td className="hidden py-3.5 pr-4 text-muted sm:table-cell">{translatedSubject}</td> */}
                <td className="hidden py-3.5 pr-4 text-muted sm:table-cell">
                  <LocalizedText text={q.subject} />
                </td>
                <td className="hidden py-3.5 pr-4 md:table-cell">
                  <Badge tone="sky">{questionTypeLabel(q.questionType, t)}</Badge>
                </td>
                <td className="hidden py-3.5 pr-4 md:table-cell">
                  <Badge tone={difficultyTone(q.difficultyLevel)}>
                    {t(`difficultyLevels.${q.difficultyLevel}`)}
                  </Badge>
                </td>
                <td className="hidden py-3.5 pr-4 text-paper lg:table-cell">{q.marks}</td>
                <td className="hidden py-3.5 pr-4 text-muted lg:table-cell">{q.negativeMarks}</td>
                <td className="hidden py-3.5 pr-4 text-muted lg:table-cell">
                  <div className="flex flex-col">
                    <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs text-muted/70">
                      {new Date(q.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </td>
                <td className="hidden py-3.5 pr-4 text-muted lg:table-cell">
                  <div className="flex flex-col">
                    <span>{new Date(q.updatedAt).toLocaleDateString()}</span>
                    <span className="text-xs text-muted/70">
                      {new Date(q.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-2">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onView(q)}
                      aria-label={t("questions.table.viewAction")}
                      className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(q)}
                      aria-label={t("questions.table.editAction")}
                      className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(q)}
                      aria-label={t("questions.table.deleteAction")}
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
