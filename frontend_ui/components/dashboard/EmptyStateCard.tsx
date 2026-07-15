// components/dashboard/EmptyStateCard.tsx
//
// Shared "not wired up yet" state for any dashboard section waiting on
// a future endpoint (Recent Results, Performance Analytics, Exam
// History, Proctoring Summary today — reused for whatever comes next).
// Deliberately styled to feel like a finished part of the product
// rather than a placeholder: gradient icon container, ambient glow,
// consistent typography. Swapping in real data later means retiring
// this component for the real one, not restyling anything.

import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type EmptyStateAccent = "teal" | "sky" | "rose";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  footnote?: string;
  accent?: EmptyStateAccent;
  className?: string;
}

const accentGradient: Record<EmptyStateAccent, string> = {
  teal: "from-accent-teal/20 to-accent-teal/5 text-accent-teal",
  sky: "from-accent-sky/20 to-accent-sky/5 text-accent-sky",
  rose: "from-accent-rose/20 to-accent-rose/5 text-accent-rose",
};

const accentGlow: Record<EmptyStateAccent, string> = {
  teal: "bg-accent-teal/10",
  sky: "bg-accent-sky/10",
  rose: "bg-accent-rose/10",
};

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  footnote,
  accent = "teal",
  className,
}: EmptyStateCardProps) {
  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col items-start gap-4 overflow-hidden p-6",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-90",
          accentGlow[accent]
        )}
      />

      <div
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-gradient-to-br",
          accentGradient[accent]
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>

      <div className="relative space-y-1.5">
        <p className="font-display text-base font-semibold text-paper">{title}</p>
        <p className="text-sm leading-relaxed text-paper/60">{description}</p>
      </div>

      {footnote && (
        <p className="relative mt-auto flex items-center gap-1.5 pt-2 text-xs font-medium uppercase tracking-wide text-paper/35">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {footnote}
        </p>
      )}
    </Card>
  );
}