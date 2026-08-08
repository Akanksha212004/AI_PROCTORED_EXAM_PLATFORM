"use client";

import { Maximize2 } from "lucide-react";

import { useI18n } from "@/hooks/useI18n";

interface Props {
  onRequestFullscreen: () => void;
}

export function FullScreenGate({ onRequestFullscreen }: Props) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 backdrop-blur-sm">
      <div className="max-w-sm rounded-2xl border border-accent-rose/40 bg-surface p-8 text-center shadow-card">
        <Maximize2 className="mx-auto h-10 w-10 text-accent-rose" />
        <h2 className="mt-4 font-display text-lg font-semibold text-paper">
          {t("examTaking.fullscreenGate.title")}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {t("examTaking.fullscreenGate.description")}
        </p>
        <button
          onClick={onRequestFullscreen}
          className="mt-6 w-full rounded-lg bg-accent-sky px-4 py-2.5 text-sm font-semibold text-surface-muted hover:bg-accent-skyHover"
        >
          {t("examTaking.fullscreenGate.button")}
        </button>
      </div>
    </div>
  );
}
