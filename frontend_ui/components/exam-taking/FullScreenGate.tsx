"use client";

import { Maximize2 } from "lucide-react";

interface Props {
  onRequestFullscreen: () => void;
}

export function FullScreenGate({ onRequestFullscreen }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 backdrop-blur-sm">
      <div className="max-w-sm rounded-2xl border border-accent-rose/40 bg-surface p-8 text-center shadow-card">
        <Maximize2 className="mx-auto h-10 w-10 text-accent-rose" />
        <h2 className="mt-4 font-display text-lg font-semibold text-paper">Fullscreen required</h2>
        <p className="mt-2 text-sm text-muted">
          This exam requires fullscreen mode. Exiting fullscreen is flagged as a proctoring violation. Return to
          fullscreen to continue.
        </p>
        <button
          onClick={onRequestFullscreen}
          className="mt-6 w-full rounded-lg bg-accent-sky px-4 py-2.5 text-sm font-semibold text-surface-muted hover:bg-accent-skyHover"
        >
          Return to Fullscreen
        </button>
      </div>
    </div>
  );
}
