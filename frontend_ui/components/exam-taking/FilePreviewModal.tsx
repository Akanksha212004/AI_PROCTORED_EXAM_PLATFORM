"use client";

import { Dialog } from "@/components/ui/Dialog";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  url: string | null;
  isPdf?: boolean;
  onClose: () => void;
}

export function FilePreviewModal({ url, isPdf, onClose }: Props) {
  const { t } = useI18n();

  return (
    <Dialog open={Boolean(url)} onClose={onClose} title={t("examTaking.uploadedAnswerTitle")} size="lg">
      {url &&
        (isPdf ? (
          <iframe src={url} className="h-[70vh] w-full rounded-lg border border-border" title="Uploaded answer preview" />
        ) : (
          <img src={url} alt="Uploaded answer" className="max-h-[70vh] w-full rounded-lg object-contain" />
        ))}
    </Dialog>
  );
}