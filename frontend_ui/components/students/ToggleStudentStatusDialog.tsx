"use client";

// components/students/ToggleStudentStatusDialog.tsx

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { updateStudentStatus } from "@/hooks/useStudents";

interface TargetStudent {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface Props {
  student: TargetStudent | null;
  onClose: () => void;
  onUpdated: (studentId: string, isActive: boolean) => void;
}

export function ToggleStudentStatusDialog({ student, onClose, onUpdated }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!student) return null;

  // We're always toggling to the opposite of the current state.
  const nextIsActive = !student.isActive;

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      const updated = await updateStudentStatus(student!.id, nextIsActive);
      onUpdated(updated.id, updated.isActive);
      toast.success(nextIsActive ? "Student account activated" : "Student account deactivated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update student status");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={Boolean(student)}
      onClose={onClose}
      title={nextIsActive ? "Activate Student" : "Deactivate Student"}
      size="sm"
    >
      <div className="flex gap-3">
        <div
          className={`shrink-0 rounded-full p-2 ${
            nextIsActive ? "bg-accent-teal/15 text-accent-teal" : "bg-accent-rose/15 text-accent-rose"
          }`}
        >
          {nextIsActive ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-sm text-paper">
            {nextIsActive
              ? "This will re-enable the student's account so they can log in again."
              : "This will block the student from logging in. Any exam session already in progress won't be interrupted."}
          </p>
          <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">
            {student.name} · {student.email}
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-4">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={isSubmitting}
          className={`w-auto px-4 ${
            nextIsActive ? "bg-accent-teal hover:bg-accent-teal/90" : "bg-accent-rose hover:bg-accent-rose/90"
          }`}
        >
          {nextIsActive ? "Activate" : "Deactivate"}
        </Button>
      </div>
    </Dialog>
  );
}
