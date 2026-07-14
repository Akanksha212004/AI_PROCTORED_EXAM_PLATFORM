import { CalendarClock } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import type { UpcomingExamItem } from "@/types/dashboard";

interface Props {
  exams: UpcomingExamItem[];
  isLoading: boolean;
}

export function UpcomingExamsCard({ exams, isLoading }: Props) {
  return (
    <Card className="p-5">
      <p className="mb-4 font-display text-base font-semibold text-paper">Upcoming Exams</p>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No upcoming exams scheduled.</p>
      ) : (
        <ul className="space-y-2">
          {exams.map((exam) => (
            <li key={exam.id}>
              <Link
                href="/dashboard/examiner/exams"
                className="flex items-center gap-3 rounded-lg border border-border px-3.5 py-2.5 transition-colors hover:border-accent-sky"
              >
                <div className="rounded-md bg-accent-sky/10 p-1.5 text-accent-sky">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-paper">{exam.title}</p>
                  <p className="text-xs text-muted">
                    {exam.subject} · {new Date(exam.startTime).toLocaleString()} · {exam.durationMinutes} min
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
