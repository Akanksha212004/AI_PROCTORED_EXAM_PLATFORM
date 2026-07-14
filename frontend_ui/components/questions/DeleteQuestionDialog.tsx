"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { questionService } from "@/services/questionService";
import { extractQuestionErrorMessage } from "@/lib/questionErrors";
import type { Question } from "@/types/question";

interface Props {
  question: Question | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteQuestionDialog({ question, onClose, onDeleted }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  if (!question) return null;

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await questionService.remove(question!.id);
      toast.success("Question deleted");
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
    <Dialog open={Boolean(question)} onClose={onClose} title="Delete Question" size="sm">
      <div className="flex gap-3">
        <div className="shrink-0 rounded-full bg-accent-rose/15 p-2 text-accent-rose">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-paper">
            Are you sure you want to delete this question? This cannot be undone.
          </p>
          <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">
            {question.questionText}
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isDeleting} className="w-auto px-4">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={isDeleting}
          className="w-auto bg-accent-rose px-4 hover:bg-accent-rose/90"
        >
          Delete
        </Button>
      </div>
    </Dialog>
  );
}
