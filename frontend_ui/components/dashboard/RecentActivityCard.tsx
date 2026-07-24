
"use client";

import { CheckCircle2, ClipboardList, FileQuestion, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { ActivityType, RecentActivityItem } from "@/types/dashboard";

interface Props {
  activity: RecentActivityItem[];
  isLoading: boolean;
}

const ICONS: Record<ActivityType, React.ReactNode> = {
  question_added: <FileQuestion className="h-4 w-4" />,
  exam_created: <ClipboardList className="h-4 w-4" />,
  submission: <Send className="h-4 w-4" />,
  graded: <CheckCircle2 className="h-4 w-4" />,
};

const DOT_COLOR: Record<ActivityType, string> = {
  question_added: "border-accent-sky text-accent-sky",
  exam_created: "border-accent-teal text-accent-teal",
  submission: "border-accent-amber text-accent-amber",
  graded: "border-accent-violet text-accent-violet",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function RecentActivityCard({ activity, isLoading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollMore, setCanScrollMore] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function updateOverflow() {
      if (!el) return;
      setCanScrollMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
    }

    updateOverflow();
    el.addEventListener("scroll", updateOverflow);
    window.addEventListener("resize", updateOverflow);
    return () => {
      el.removeEventListener("scroll", updateOverflow);
      window.removeEventListener("resize", updateOverflow);
    };
  }, [activity]);

  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <p className="font-display text-base font-semibold text-paper">Recent Activity</p>
        {canScrollMore && (
          <p className="text-xs text-muted">Scroll for more →</p>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-9 overflow-x-auto pb-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex w-32 shrink-0 flex-col items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-surface-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
              <div className="h-2.5 w-12 animate-pulse rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      ) : activity.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No activity yet.</p>
      ) : (
        <div className="relative">
          <div ref={scrollRef} className="overflow-x-auto pb-1">
            <div className="flex w-full justify-between gap-9">
              {activity.map((item, i) => (
                <div key={i} className="group relative flex w-32 shrink-0 flex-col items-center text-center">
                  {i < activity.length - 1 && (
                    <span
                      className="absolute left-1/2 top-[18px] hidden border-t border-dashed border-border sm:block"
                      style={{ width: "calc(100% + 2.25rem)" }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-ink transition-transform duration-200 group-hover:scale-110",
                      DOT_COLOR[item.type]
                    )}
                  >
                    {ICONS[item.type]}
                  </span>
                  <p className="mt-3 line-clamp-2 text-xs font-medium text-paper transition-colors group-hover:text-accent-sky">
                    {item.message}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted">{relativeTime(item.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
          {canScrollMore && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-surface to-transparent"
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </Card>
  );
}
