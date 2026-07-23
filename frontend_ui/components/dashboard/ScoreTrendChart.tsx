"use client";

import { TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { ScoreTrendPoint } from "@/hooks/useAnalytics";

interface Props {
  data: ScoreTrendPoint[];
  isLoading: boolean;
}

const WIDTH = 600;
const HEIGHT = 220;
const PAD_X = 28;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;

function formatWeekLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

export function ScoreTrendChart({ data, isLoading }: Props) {
  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = data.map((point, i) => {
    const x = data.length > 1 ? PAD_X + (i / (data.length - 1)) * plotWidth : PAD_X + plotWidth / 2;
    const y = point.averageScore !== null ? PAD_TOP + plotHeight * (1 - point.averageScore / 100) : null;
    return { ...point, x, y };
  });

  // Break the line wherever a week has no data, so the chart shows real
  // gaps instead of drawing a misleading straight line through them.
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  for (const p of points) {
    if (p.y === null) {
      if (current.length > 0) segments.push(current);
      current = [];
    } else {
      current.push({ x: p.x, y: p.y });
    }
  }
  if (current.length > 0) segments.push(current);

  const linePaths = segments.map((seg) => seg.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" "));
  const gridLines = [0, 25, 50, 75, 100];
  const hasAnyData = data.some((d) => d.attempts > 0);

  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <TrendingUp className="h-4 w-4 text-accent-sky" />
          Score Trend
        </p>
        <p className="text-xs text-muted">Weekly average</p>
      </div>

      {isLoading ? (
        <div className="h-[220px] animate-pulse rounded-lg bg-surface-muted" />
      ) : !hasAnyData ? (
        <p className="flex h-[220px] items-center justify-center text-sm text-muted">
          No graded submissions in this period yet.
        </p>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Weekly average score trend">
          {gridLines.map((g) => {
            const y = PAD_TOP + plotHeight * (1 - g / 100);
            return (
              <g key={g}>
                <line x1={PAD_X} x2={WIDTH - PAD_X} y1={y} y2={y} className="stroke-border" strokeDasharray="4 4" />
                <text x={4} y={y + 4} fontSize="10" className="fill-muted">
                  {g}%
                </text>
              </g>
            );
          })}

          {linePaths.map((d, i) => (
            <path
              key={`line-${i}`}
              d={d}
              fill="none"
              className="stroke-accent-sky"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ))}

          {points.map((p, i) =>
            p.y !== null ? (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} strokeWidth={2.5} className="fill-ink stroke-accent-sky" />
                <title>
                  {formatWeekLabel(p.weekStart)}: {p.averageScore}% ({p.attempts} attempt{p.attempts === 1 ? "" : "s"})
                </title>
              </g>
            ) : null
          )}

          {points.map(
            (p, i) =>
              (i === 0 || i === points.length - 1 || i % Math.max(1, Math.ceil(points.length / 6)) === 0) && (
                <text key={`label-${i}`} x={p.x} y={HEIGHT - 8} fontSize="10" className="fill-muted" textAnchor="middle">
                  {formatWeekLabel(p.weekStart)}
                </text>
              )
          )}
        </svg>
      )}
    </Card>
  );
}
