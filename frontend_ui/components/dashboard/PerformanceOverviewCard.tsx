"use client";

// components/dashboard/PerformanceOverviewCard.tsx
//
// Compact score-ring summary that sits next to Today's Exams. Kept deliberately
// short (ring + legend only) so its height naturally matches the exam card row —
// the full subject breakdown lives in its own full-width StudentSubjectPerformanceCard
// below, where a long subject list has room to breathe without forcing this card
// (and the empty space beside it) to stretch.

import Link from "next/link";
import { Gauge } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { StudentPerformanceStats } from "@/hooks/useStudentDashboard";

interface Props {
  performance: StudentPerformanceStats;
  isLoading: boolean;
}

const SIZE = 168;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PerformanceOverviewCard({ performance, isLoading }: Props) {
  const hasData = performance.averageScore !== null;
  const scoreDash = hasData ? (CIRCUMFERENCE * (performance.averageScore as number)) / 100 : 0;

  return (
    <Card interactive className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <Gauge className="h-4 w-4 text-accent-sky" />
          Performance Overview
        </p>
        <Link href="/dashboard/student/history" className="text-xs font-medium text-accent-sky hover:text-accent-sky/80">
          View all →
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-[168px] w-[168px] animate-pulse rounded-full bg-surface-muted" />
          </div>
        ) : !hasData ? (
          <p className="py-10 text-center text-sm text-muted">No graded exams yet — your results will show up here.</p>
        ) : (
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-around">
            <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
              <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
                <defs>
                  <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B7FE8" />
                    <stop offset="35%" stopColor="#3FA7E8" />
                    <stop offset="65%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#F5A623" />
                  </linearGradient>
                </defs>
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={STROKE}
                  className="stroke-surface-muted"
                />
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  stroke="url(#scoreRingGradient)"
                  className="transition-all duration-700"
                  strokeDasharray={`${scoreDash} ${CIRCUMFERENCE - scoreDash}`}
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-semibold text-paper">{performance.averageScore}%</span>
                <span className="text-[10px] uppercase tracking-wide text-muted">Average Score</span>
              </div>
            </div>

            <div className="space-y-4 text-base">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-teal" />
                <span className="text-paper/80">Best Score</span>
                <span className="font-mono text-xs text-muted">{performance.bestScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-rose" />
                <span className="text-paper/80">Lowest Score</span>
                <span className="font-mono text-xs text-muted">{performance.lowestScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-sky" />
                <span className="text-paper/80">Total Exams</span>
                <span className="font-mono text-xs text-muted">{performance.completedCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-amber" />
                <span className="text-paper/80">Pending Results</span>
                <span className="font-mono text-xs text-muted">{performance.pendingReviewCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}