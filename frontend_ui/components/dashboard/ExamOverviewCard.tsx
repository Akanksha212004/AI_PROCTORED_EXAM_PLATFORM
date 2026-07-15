// "use client";

// import { Layers, Radio } from "lucide-react";
// import Link from "next/link";

// import { Card } from "@/components/ui/Card";
// import { cn } from "@/lib/utils";
// import { useExamStats } from "@/hooks/useExamStats";
// import type { ExamStatus } from "@/types/exam";

// const STATUS_CLASS: Record<ExamStatus, string> = {
//   DRAFT: "bg-surface-muted text-muted border border-border",
//   PUBLISHED: "bg-accent-teal/10 text-accent-teal",
//   CANCELLED: "bg-accent-rose/10 text-accent-rose",
// };

// export function ExamOverviewCard() {
//   const { stats, isLoading } = useExamStats();

//   return (
//     <Card className="p-5">
//       <div className="mb-4 flex items-center justify-between">
//         <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
//           <Layers className="h-4 w-4 text-accent-sky" />
//           Exam Overview
//         </p>
//         <Link href="/dashboard/examiner/exams" className="text-xs font-medium text-accent-sky hover:underline">
//           Manage exams
//         </Link>
//       </div>

//       {isLoading || !stats ? (
//         <div className="space-y-3">
//           <div className="h-16 animate-pulse rounded-lg bg-surface-muted" />
//           <div className="h-16 animate-pulse rounded-lg bg-surface-muted" />
//         </div>
//       ) : (
//         <>
//           <div className="mb-5 grid grid-cols-3 gap-3">
//             <div className="rounded-lg border border-border bg-surface-muted p-3">
//               <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
//                 <Radio className="h-3 w-3 text-accent-rose" />
//                 Active now
//               </p>
//               <p className="mt-1 font-mono text-xl font-bold text-paper">{stats.activeNowCount}</p>
//             </div>
//             <div className="rounded-lg border border-border bg-surface-muted p-3">
//               <p className="text-[11px] uppercase tracking-wide text-muted">Upcoming</p>
//               <p className="mt-1 font-mono text-xl font-bold text-paper">{stats.upcomingCount}</p>
//             </div>
//             <div className="rounded-lg border border-border bg-surface-muted p-3">
//               <p className="text-[11px] uppercase tracking-wide text-muted">Total</p>
//               <p className="mt-1 font-mono text-xl font-bold text-paper">{stats.totalExams}</p>
//             </div>
//           </div>

//           {stats.recentExams.length === 0 ? (
//             <p className="py-6 text-center text-sm text-muted">No exams created yet.</p>
//           ) : (
//             <ul className="space-y-2">
//               {stats.recentExams.map((exam) => (
//                 <li key={exam.id}>
//                   <Link
//                     href="/dashboard/examiner/exams"
//                     className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5 transition-colors hover:border-accent-sky"
//                   >
//                     <div className="min-w-0">
//                       <p className="truncate text-sm text-paper">{exam.title}</p>
//                       <p className="text-xs text-muted">{exam.subject}</p>
//                     </div>
//                     <span
//                       className={cn(
//                         "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
//                         STATUS_CLASS[exam.status]
//                       )}
//                     >
//                       {exam.status}
//                     </span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           )}

//           {stats.isSampled && (
//             <p className="mt-3 text-[11px] text-muted">
//               Counts based on the first 100 exams — add a dedicated stats endpoint for exact totals at scale.
//             </p>
//           )}
//         </>
//       )}
//     </Card>
//   );
// }





"use client";

import { Layers, Radio } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useExamStats } from "@/hooks/useExamStats";
import type { ExamStatus } from "@/types/exam";

const STATUS_CLASS: Record<ExamStatus, string> = {
  DRAFT: "bg-surface-muted text-muted border border-border",
  PUBLISHED: "bg-accent-teal/10 text-accent-teal",
  CANCELLED: "bg-accent-rose/10 text-accent-rose",
};

const BAR_COLORS = ["#3FA7E8", "#14B8A6", "#8B7FE8", "#F5A623", "#5FB6EE"];
const MAX_BARS = 5;

function SubjectBars({ data }: { data: { subject: string; count: number }[] }) {
  const top = data.slice(0, MAX_BARS);
  const max = Math.max(...top.map((d) => d.count), 1);

  return (
    <div className="space-y-2.5">
      {top.map((d, i) => (
        <div key={d.subject} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-muted" title={d.subject}>
            {d.subject}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(d.count / max) * 100}%`,
                background: BAR_COLORS[i % BAR_COLORS.length],
              }}
            />
          </div>
          <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-paper">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

export function ExamOverviewCard() {
  const { stats, isLoading } = useExamStats();

  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <Layers className="h-4 w-4 text-accent-sky" />
          Exam Overview
        </p>
        <Link
          href="/dashboard/examiner/exams"
          className="text-xs font-medium text-accent-sky transition-colors hover:text-accent-skyHover hover:underline"
        >
          Manage exams
        </Link>
      </div>

      {isLoading || !stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
            ))}
          </div>
          <div className="h-24 animate-pulse rounded-lg bg-surface-muted" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="group rounded-lg border border-border bg-surface-muted p-3 transition-colors hover:border-accent-rose/40">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
                <Radio className="h-3 w-3 text-accent-rose" />
                Active now
              </p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-paper">{stats.activeNowCount}</p>
            </div>
            <div className="group rounded-lg border border-border bg-surface-muted p-3 transition-colors hover:border-accent-sky/40">
              <p className="text-[11px] uppercase tracking-wide text-muted">Upcoming</p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-paper">{stats.upcomingCount}</p>
            </div>
            <div className="group rounded-lg border border-border bg-surface-muted p-3 transition-colors hover:border-accent-teal/40">
              <p className="text-[11px] uppercase tracking-wide text-muted">Total</p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-paper">{stats.totalExams}</p>
            </div>
          </div>

          {stats.subjectCounts.length > 0 && (
            <div className="mb-6">
              <p className="mb-3 text-[11px] uppercase tracking-wide text-muted">Exams by subject</p>
              <SubjectBars data={stats.subjectCounts} />
            </div>
          )}

          {stats.recentExams.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No exams created yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentExams.map((exam) => (
                <li key={exam.id}>
                  <Link
                    href="/dashboard/examiner/exams"
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5 transition-colors hover:border-accent-sky"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-paper">{exam.title}</p>
                      <p className="text-xs text-muted">{exam.subject}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                        STATUS_CLASS[exam.status]
                      )}
                    >
                      {exam.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {stats.isSampled && (
            <p className="mt-3 text-[11px] text-muted">
              Counts based on the first 100 exams — add a dedicated stats endpoint for exact totals at scale.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
