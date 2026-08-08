"use client";

import { AlertTriangle } from "lucide-react";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  open: boolean;
  unansweredCount: number;
  totalCount: number;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SubmitConfirmDialog({ open, unansweredCount, totalCount, isSubmitting, onClose, onConfirm }: Props) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onClose={onClose} title={t("examTaking.submitModal.title")} size="sm">
      <div className="flex gap-3">
        <div className="shrink-0 rounded-full bg-amber-500/15 p-2 text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-paper">
            {t("examTaking.submitModal.warning")}
          </p>
          {unansweredCount > 0 && (
            <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
              {t("examTaking.submitModal.unansweredWarning", { count: `${unansweredCount} / ${totalCount}` })}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-4">
          {t("examTaking.submitModal.keepWorking")}
        </Button>
        <Button onClick={onConfirm} isLoading={isSubmitting} className="w-auto px-5">
          {t("examTaking.submitModal.confirmSubmit")}
        </Button>
      </div>
    </Dialog>
  );
}
