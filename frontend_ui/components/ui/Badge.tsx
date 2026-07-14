import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "sky" | "teal" | "rose" | "neutral" | "amber";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  sky: "bg-accent-sky/15 text-accent-sky border-accent-sky/30",
  teal: "bg-accent-teal/15 text-accent-teal border-accent-teal/30",
  rose: "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  neutral: "bg-white/5 text-muted border-border",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export function difficultyTone(level: string): BadgeTone {
  if (level === "EASY") return "teal";
  if (level === "MEDIUM") return "amber";
  return "rose"; // HARD
}

export function questionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MCQ: "MCQ",
    MULTI_SELECT: "Multi-Select",
    SHORT_ANSWER: "Short Answer",
    LONG_ANSWER: "Long Answer",
    IMAGE_UPLOAD: "Image Upload",
  };
  return labels[type] ?? type;
}
