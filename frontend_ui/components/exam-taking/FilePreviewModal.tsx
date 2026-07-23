"use client";

import { Dialog } from "@/components/ui/Dialog";

interface Props {
  url: string | null;
  isPdf?: boolean;
  onClose: () => void;
}

export function FilePreviewModal({ url, isPdf, onClose }: Props) {
  return (
    <Dialog open={Boolean(url)} onClose={onClose} title="Uploaded Answer" size="lg">
      {url &&
        (isPdf ? (
          <iframe src={url} className="h-[70vh] w-full rounded-lg border border-border" title="Uploaded answer preview" />
        ) : (
          <img src={url} alt="Uploaded answer" className="max-h-[70vh] w-full rounded-lg object-contain" />
        ))}
    </Dialog>
  );
}