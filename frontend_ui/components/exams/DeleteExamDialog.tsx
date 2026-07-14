"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { examService } from "@/services/examService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { Exam } from "@/types/exam";

interface Props {
  exam: Exam | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteExamDialog({ exam, onClose, onDeleted }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  if (!exam) return null;

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await examService.remove(exam!.id);
      toast.success("Exam deleted");
      onDeleted();
      onClose();
    } catch (err) {
      // Backend returns 409 if the exam already has student sessions —
      // surface that message as-is, it matters.
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={Boolean(exam)} onClose={onClose} title="Delete Exam" size="sm">
      <div className="flex gap-3">
        <div className="shrink-0 rounded-full bg-accent-rose/15 p-2 text-accent-rose">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-paper">Are you sure you want to delete this exam? This cannot be undone.</p>
          <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">{exam.title}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isDeleting} className="w-auto px-4">
          Cancel
        </Button>
        <Button onClick={handleConfirm} isLoading={isDeleting} className="w-auto bg-accent-rose px-4 hover:bg-accent-rose/90">
          Delete
        </Button>
      </div>
    </Dialog>
  );
}
