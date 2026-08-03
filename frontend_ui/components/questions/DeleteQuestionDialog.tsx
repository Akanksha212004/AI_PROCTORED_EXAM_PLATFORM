"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/hooks/useI18n";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { questionService } from "@/services/questionService";
import { extractQuestionErrorMessage } from "@/lib/questionErrors";
import type { Question } from "@/types/question";

interface Props {
  question: Question | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteQuestionDialog({ question, onClose, onDeleted }: Props) {
  const { t } = useI18n();
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic content — the question text being confirmed for deletion —
  // translated the same way as everywhere else; hook runs unconditionally
  // before the `!question` guard below.
  const { translated } = useTranslatedTexts(question ? [question.questionText] : []);
  const translatedQuestionText = question ? translated[0] ?? question.questionText : "";

  if (!question) return null;

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await questionService.remove(question!.id);
      toast.success(t("questions.deleteDialog.successToast"));
      onDeleted();
      onClose();
    } catch (err) {
      // The backend returns 409 if this question is already used inside
      // an exam's question pool — surfacing that message as-is matters.
      toast.error(extractQuestionErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={Boolean(question)} onClose={onClose} title={t("questions.deleteDialog.title")} size="sm">
      <div className="flex gap-3">
        <div className="shrink-0 rounded-full bg-accent-rose/15 p-2 text-accent-rose">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-paper">{t("questions.deleteDialog.message")}</p>
          <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">
            {translatedQuestionText}
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isDeleting} className="w-auto px-4">
          {t("questions.deleteDialog.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={isDeleting}
          className="w-auto bg-accent-rose px-4 hover:bg-accent-rose/90"
        >
          {t("questions.deleteDialog.confirm")}
        </Button>
      </div>
    </Dialog>
  );
}
