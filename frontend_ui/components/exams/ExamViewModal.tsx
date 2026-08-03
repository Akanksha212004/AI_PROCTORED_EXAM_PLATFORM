"use client";

import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { questionTypeLabel } from "@/components/ui/Badge";
import { useI18n } from "@/hooks/useI18n";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import type { Exam } from "@/types/exam";

interface Props {
  exam: Exam | null;
  onClose: () => void;
}

export function ExamViewModal({ exam, onClose }: Props) {
  const { t } = useI18n();

  // Dynamic (examiner-authored) content only: title, subject, each
  // selection rule's subject filter, and the curated pool's question
  // text + subject. Hook runs unconditionally (before the `!exam`
  // guard) with an empty array when there's nothing to show yet.
  //
  // Layout: [title, subject, ...selectionRule subjects (may be ""),
  // ...curated pool question texts, ...curated pool subjects]
  const ruleSubjects = exam?.selectionRules.map((r) => r.subject ?? "") ?? [];
  const poolQuestionTexts = exam?.examQuestions.map((p) => p.question.questionText) ?? [];
  const poolSubjects = exam?.examQuestions.map((p) => p.question.subject) ?? [];
  const dynamicTexts = exam
    ? [exam.title, exam.subject, ...ruleSubjects, ...poolQuestionTexts, ...poolSubjects]
    : [];
  const { translated } = useTranslatedTexts(dynamicTexts);

  if (!exam) return null;

  const translatedTitle = translated[0] ?? exam.title;
  const translatedSubject = translated[1] ?? exam.subject;
  const translatedRuleSubjects = translated.slice(2, 2 + ruleSubjects.length);
  const poolStart = 2 + ruleSubjects.length;
  const translatedPoolQuestionTexts = translated.slice(poolStart, poolStart + poolQuestionTexts.length);
  const translatedPoolSubjects = translated.slice(
    poolStart + poolQuestionTexts.length,
    poolStart + poolQuestionTexts.length + poolSubjects.length
  );

  return (
    <Dialog open={Boolean(exam)} onClose={onClose} title={translatedTitle} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {/* exam.status is a Prisma enum — shown via the pre-built examStatus.* labels */}
          <Badge tone={exam.status === "PUBLISHED" ? "teal" : exam.status === "CANCELLED" ? "rose" : "amber"}>
            {t(`examStatus.${exam.status}`)}
          </Badge>
          <Badge tone="neutral">{translatedSubject}</Badge>
          <Badge tone="sky">
            {exam.durationMinutes} {t("exams.table.minutesSuffix")}
          </Badge>
          <Badge tone="sky">
            {exam.totalMarks} {t("exams.viewModal.marksSuffix")} ({t("exams.viewModal.passPrefix")} {exam.passingMarks})
          </Badge>
          <Badge tone="neutral">{exam.randomizationMode.replace(/_/g, " ")}</Badge>
          {exam.negativeMarkingEnabled && <Badge tone="rose">{t("exams.viewModal.negativeMarking")}</Badge>}
          {exam.webcamMonitoringEnabled && <Badge tone="teal">{t("exams.viewModal.webcamMonitoring")}</Badge>}
          {exam.multiFaceDetectionEnabled && <Badge tone="teal">{t("exams.viewModal.multiFaceDetection")}</Badge>}
          {exam.fullScreenModeEnabled && <Badge tone="teal">{t("exams.viewModal.fullScreenEnforced")}</Badge>}
          {exam.audioMonitoringEnabled && (
            <Badge tone="amber">{t("exams.viewModal.audioMonitoring")}</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">{t("exams.viewModal.start")}</p>
            <p className="mt-1 text-paper">{new Date(exam.startTime).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">{t("exams.viewModal.end")}</p>
            <p className="mt-1 text-paper">{new Date(exam.endTime).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">{t("exams.viewModal.gazeSensitivity")}</p>
            <p className="mt-1 text-paper">{exam.gazeSensitivity}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">{t("exams.viewModal.maxTabSwitchWarnings")}</p>
            <p className="mt-1 text-paper">{exam.maxTabSwitchWarnings}</p>
          </div>
        </div>

        {exam.selectionRules.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{t("exams.viewModal.selectionRules")}</p>
            <ul className="space-y-1.5">
              {exam.selectionRules.map((r, i) => (
                <li key={r.id} className="rounded-lg border border-border bg-surface-muted px-3.5 py-2 text-sm text-paper">
                  {t("exams.viewModal.pick")} <span className="text-accent-sky">{r.count}</span>
                  {r.difficultyLevel ? ` ${t(`difficultyLevels.${r.difficultyLevel}`)}` : ""}
                  {r.questionType ? ` ${questionTypeLabel(r.questionType, t)}` : ` ${t("exams.viewModal.questionsWord")}`}
                  {r.subject ? ` ${t("exams.viewModal.from")} ${translatedRuleSubjects[i] || r.subject}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {exam.examQuestions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {t("exams.viewModal.curatedPool")} ({exam.examQuestions.length})
            </p>
            <ul className="max-h-48 space-y-1.5 overflow-y-auto">
              {exam.examQuestions.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2 text-sm">
                  <span className="truncate text-paper">
                    {translatedPoolQuestionTexts[i] ?? p.question.questionText}
                  </span>
                  <Badge tone="neutral">{translatedPoolSubjects[i] ?? p.question.subject}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between border-t border-border pt-4 text-xs text-muted">
          <span>
            {t("exams.viewModal.created")} {new Date(exam.createdAt).toLocaleString()}
          </span>
          <span>
            {t("exams.viewModal.updated")} {new Date(exam.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>
    </Dialog>
  );
}
