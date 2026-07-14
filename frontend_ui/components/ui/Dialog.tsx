"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

/** Generic modal, styled to match Card (rounded-2xl, border-border, bg-surface, shadow-card). */
export function Dialog({ open, onClose, title, description, children, size = "md" }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 px-4 py-8 backdrop-blur-sm animate-in fade-in">
      <div
        className={cn(
          "w-full rounded-2xl border border-border bg-surface shadow-card",
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 id="dialog-title" className="font-display text-lg font-semibold text-paper">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-paper"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
