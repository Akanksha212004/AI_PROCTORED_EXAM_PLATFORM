"use client";

import { AlertTriangle } from "lucide-react";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  unansweredCount: number;
  totalCount: number;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SubmitConfirmDialog({ open, unansweredCount, totalCount, isSubmitting, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onClose} title="Submit Exam" size="sm">
      <div className="flex gap-3">
        <div className="shrink-0 rounded-full bg-amber-500/15 p-2 text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-paper">
            Are you sure you want to submit? You cannot change your answers after this.
          </p>
          {unansweredCount > 0 && (
            <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
              {unansweredCount} of {totalCount} questions are still unanswered.
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-4">
          Keep working
        </Button>
        <Button onClick={onConfirm} isLoading={isSubmitting} className="w-auto px-5">
          Submit Exam
        </Button>
      </div>
    </Dialog>
  );
}
