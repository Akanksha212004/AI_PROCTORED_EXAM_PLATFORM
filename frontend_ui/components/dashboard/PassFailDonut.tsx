"use client";

import { Target } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { PassFailRate } from "@/hooks/useAnalytics";

interface Props {
  data: PassFailRate;
  isLoading: boolean;
}

const SIZE = 140;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PassFailDonut({ data, isLoading }: Props) {
  const passRatio = data.total > 0 ? data.passed / data.total : 0;
  const passDash = CIRCUMFERENCE * passRatio;

  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <Target className="h-4 w-4 text-accent-teal" />
          Pass / Fail Rate
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="h-[140px] w-[140px] animate-pulse rounded-full bg-surface-muted" />
        </div>
      ) : data.total === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No graded submissions yet.</p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-around">
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE}
                className="stroke-accent-rose/20"
              />
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE}
                strokeLinecap="round"
                className="stroke-accent-teal transition-all duration-700"
                strokeDasharray={`${passDash} ${CIRCUMFERENCE - passDash}`}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-semibold text-paper">{data.passRate}%</span>
              <span className="text-[10px] uppercase tracking-wide text-muted">Pass rate</span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-teal" />
              <span className="text-paper/80">Passed</span>
              <span className="font-mono text-xs text-muted">{data.passed}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-rose/40" />
              <span className="text-paper/80">Failed</span>
              <span className="font-mono text-xs text-muted">{data.failed}</span>
            </div>
            <div className="border-t border-border pt-2 text-xs text-muted">{data.total} total attempts</div>
          </div>
        </div>
      )}
    </Card>
  );
}
