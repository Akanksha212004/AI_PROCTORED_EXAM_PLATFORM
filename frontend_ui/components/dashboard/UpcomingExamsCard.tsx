// import { CalendarClock } from "lucide-react";
// import Link from "next/link";

// import { Card } from "@/components/ui/Card";
// import type { UpcomingExamItem } from "@/types/dashboard";

// interface Props {
//   exams: UpcomingExamItem[];
//   isLoading: boolean;
// }

// export function UpcomingExamsCard({ exams, isLoading }: Props) {
//   return (
//     <Card className="p-5">
//       <p className="mb-4 font-display text-base font-semibold text-paper">Upcoming Exams</p>
//       {isLoading ? (
//         <div className="space-y-3">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-muted" />
//           ))}
//         </div>
//       ) : exams.length === 0 ? (
//         <p className="py-8 text-center text-sm text-muted">No upcoming exams scheduled.</p>
//       ) : (
//         <ul className="space-y-2">
//           {exams.map((exam) => (
//             <li key={exam.id}>
//               <Link
//                 href="/dashboard/examiner/exams"
//                 className="flex items-center gap-3 rounded-lg border border-border px-3.5 py-2.5 transition-colors hover:border-accent-sky"
//               >
//                 <div className="rounded-md bg-accent-sky/10 p-1.5 text-accent-sky">
//                   <CalendarClock className="h-4 w-4" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="truncate text-sm text-paper">{exam.title}</p>
//                   <p className="text-xs text-muted">
//                     {exam.subject} · {new Date(exam.startTime).toLocaleString()} · {exam.durationMinutes} min
//                   </p>
//                 </div>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       )}
//     </Card>
//   );
// }





// import { CalendarClock } from "lucide-react";
// import Link from "next/link";

// import { Card } from "@/components/ui/Card";
// import type { UpcomingExamItem } from "@/types/dashboard";

// interface Props {
//   exams: UpcomingExamItem[];
//   isLoading: boolean;
// }

// function daysAwayLabel(iso: string): string {
//   const diffMs = new Date(iso).getTime() - Date.now();
//   const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
//   if (days <= 0) return "Today";
//   if (days === 1) return "Tomorrow";
//   return `In ${days}d`;
// }

// export function UpcomingExamsCard({ exams, isLoading }: Props) {
//   return (
//     <Card className="p-5">
//       <p className="mb-4 font-display text-base font-semibold text-paper">Upcoming Exams</p>
//       {isLoading ? (
//         <div className="space-y-3">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
//           ))}
//         </div>
//       ) : exams.length === 0 ? (
//         <p className="py-8 text-center text-sm text-muted">No upcoming exams scheduled.</p>
//       ) : (
//         <ul className="space-y-2.5">
//           {exams.map((exam) => {
//             const start = new Date(exam.startTime);
//             return (
//               <li key={exam.id}>
//                 <Link
//                   href="/dashboard/examiner/exams"
//                   className="flex items-center gap-3 rounded-lg border border-border px-3.5 py-2.5 transition-colors hover:border-accent-sky"
//                 >
//                   <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface-muted">
//                     <span className="font-mono text-sm font-bold leading-none text-paper">
//                       {start.getDate()}
//                     </span>
//                     <span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted">
//                       {start.toLocaleString(undefined, { month: "short" })}
//                     </span>
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <p className="truncate text-sm text-paper">{exam.title}</p>
//                     <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
//                       <span>{exam.subject}</span>
//                       <span>·</span>
//                       <span>{start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
//                       <span>·</span>
//                       <span>{exam.durationMinutes} min</span>
//                     </p>
//                   </div>
//                   <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-sky/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-sky">
//                     <CalendarClock className="h-3 w-3" />
//                     {daysAwayLabel(exam.startTime)}
//                   </span>
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </Card>
//   );
// }





// import { CalendarClock } from "lucide-react";
// import Link from "next/link";

// import { Card } from "@/components/ui/Card";

// interface Props {
//   exams: import("@/types/dashboard").UpcomingExamItem[];
//   isLoading: boolean;
// }

// function daysAwayLabel(iso: string): string {
//   const diffMs = new Date(iso).getTime() - Date.now();
//   const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
//   if (days <= 0) return "Today";
//   if (days === 1) return "Tomorrow";
//   return `In ${days}d`;
// }

// export function UpcomingExamsCard({ exams, isLoading }: Props) {
//   return (
//     <Card interactive className="p-5 sm:p-6">
//       <p className="mb-4 font-display text-base font-semibold text-paper">Upcoming Exams</p>
//       {isLoading ? (
//         <div className="space-y-2.5">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="flex items-center gap-3 rounded-lg border border-border px-3.5 py-2.5">
//               <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-surface-muted" />
//               <div className="flex-1 space-y-2">
//                 <div className="h-3.5 w-32 animate-pulse rounded bg-surface-muted" />
//                 <div className="h-2.5 w-44 animate-pulse rounded bg-surface-muted" />
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : exams.length === 0 ? (
//         <p className="py-8 text-center text-sm text-muted">No upcoming exams scheduled.</p>
//       ) : (
//         <ul className="space-y-2.5">
//           {exams.map((exam) => {
//             const start = new Date(exam.startTime);
//             return (
//               <li key={exam.id}>
//                 <Link
//                   href="/dashboard/examiner/exams"
//                   className="group flex items-center gap-3 rounded-lg border border-border px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-sky hover:shadow-glow-sky"
//                 >
//                   <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface-muted transition-colors group-hover:border-accent-sky/40">
//                     <span className="font-mono text-sm font-bold leading-none tabular-nums text-paper">
//                       {start.getDate()}
//                     </span>
//                     <span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted">
//                       {start.toLocaleString(undefined, { month: "short" })}
//                     </span>
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <p className="truncate text-sm text-paper transition-colors group-hover:text-accent-sky">
//                       {exam.title}
//                     </p>
//                     <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
//                       <span>{exam.subject}</span>
//                       <span>·</span>
//                       <span>{start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
//                       <span>·</span>
//                       <span>{exam.durationMinutes} min</span>
//                     </p>
//                   </div>
//                   <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-sky/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-sky">
//                     <CalendarClock className="h-3 w-3" />
//                     {daysAwayLabel(exam.startTime)}
//                   </span>
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </Card>
//   );
// }




import { CalendarClock } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";

export interface UpcomingExamCardItem {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  durationMinutes: number;
}

interface Props {
  exams: UpcomingExamCardItem[];
  isLoading: boolean;
  href?: string;
}

function daysAwayLabel(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days}d`;
}

export function UpcomingExamsCard({ exams, isLoading, href = "/dashboard/examiner/exams" }: Props) {
  return (
    <Card interactive className="p-5 sm:p-6">
      <p className="mb-4 font-display text-base font-semibold text-paper">Upcoming Exams</p>
      {isLoading ? (
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border px-3.5 py-2.5">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-surface-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 animate-pulse rounded bg-surface-muted" />
                <div className="h-2.5 w-44 animate-pulse rounded bg-surface-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No upcoming exams scheduled.</p>
      ) : (
        <ul className="space-y-2.5">
          {exams.map((exam) => {
            const start = new Date(exam.startTime);
            return (
              <li key={exam.id}>
                <Link
                  href={href}
                  className="group flex items-center gap-3 rounded-lg border border-border px-3.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-sky hover:shadow-glow-sky"
                >
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface-muted transition-colors group-hover:border-accent-sky/40">
                    <span className="font-mono text-sm font-bold leading-none tabular-nums text-paper">
                      {start.getDate()}
                    </span>
                    <span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted">
                      {start.toLocaleString(undefined, { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-paper transition-colors group-hover:text-accent-sky">
                      {exam.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                      <span>{exam.subject}</span>
                      <span>·</span>
                      <span>{start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>·</span>
                      <span>{exam.durationMinutes} min</span>
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-sky/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-sky">
                    <CalendarClock className="h-3 w-3" />
                    {daysAwayLabel(exam.startTime)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}