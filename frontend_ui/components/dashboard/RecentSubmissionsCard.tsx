// "use client";

// import { ClipboardCheck } from "lucide-react";
// import Link from "next/link";

// import { Card } from "@/components/ui/Card";
// import { cn } from "@/lib/utils";
// import { useSubmissions } from "@/hooks/useSubmissions";
// import type { GradingStatus } from "@/types/submission";

// const STATUS_LABEL: Record<GradingStatus, string> = {
//   FULLY_AUTO_GRADED: "Auto-Graded",
//   PENDING_REVIEW: "Pending Review",
//   FULLY_GRADED: "Graded",
// };

// const STATUS_CLASS: Record<GradingStatus, string> = {
//   FULLY_AUTO_GRADED: "bg-accent-teal/10 text-accent-teal",
//   PENDING_REVIEW: "bg-accent-amber/10 text-accent-amber",
//   FULLY_GRADED: "bg-accent-violet/10 text-accent-violet",
// };

// function formatSubmittedAt(iso: string | null): string {
//   if (!iso) return "—";
//   return new Date(iso).toLocaleString(undefined, {
//     month: "short",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// export function RecentSubmissionsCard() {
//   const { items, isLoading } = useSubmissions({ page: 1, limit: 5 });

//   return (
//     <Card className="p-5">
//       <div className="mb-4 flex items-center justify-between">
//         <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
//           <ClipboardCheck className="h-4 w-4 text-accent-sky" />
//           Recent Submissions
//         </p>
//         <Link href="/dashboard/examiner/submissions" className="text-xs font-medium text-accent-sky hover:underline">
//           View all
//         </Link>
//       </div>

//       {isLoading ? (
//         <div className="space-y-3">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
//           ))}
//         </div>
//       ) : items.length === 0 ? (
//         <p className="py-8 text-center text-sm text-muted">No submissions yet.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
//                 <th className="pb-2.5 font-medium">Student</th>
//                 <th className="pb-2.5 font-medium">Exam</th>
//                 <th className="pb-2.5 font-medium">Submitted</th>
//                 <th className="pb-2.5 font-medium">Status</th>
//                 <th className="pb-2.5" />
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((item) => (
//                 <tr key={item.id} className="border-b border-border/60 last:border-0">
//                   <td className="py-2.5 pr-3">
//                     <p className="truncate text-paper">{item.studentName}</p>
//                     <p className="truncate text-xs text-muted">{item.studentEmail}</p>
//                   </td>
//                   <td className="py-2.5 pr-3 text-muted">
//                     <p className="truncate text-paper">{item.examTitle}</p>
//                     <p className="text-xs text-muted">{item.examSubject}</p>
//                   </td>
//                   <td className="whitespace-nowrap py-2.5 pr-3 font-mono text-xs text-muted">
//                     {formatSubmittedAt(item.submittedAt)}
//                   </td>
//                   <td className="py-2.5 pr-3">
//                     <span
//                       className={cn(
//                         "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
//                         STATUS_CLASS[item.gradingStatus]
//                       )}
//                     >
//                       {STATUS_LABEL[item.gradingStatus]}
//                     </span>
//                     {item.pendingCount > 0 && (
//                       <span className="ml-1.5 font-mono text-[11px] text-accent-amber">
//                         {item.pendingCount} left
//                       </span>
//                     )}
//                   </td>
//                   <td className="py-2.5 text-right">
//                     <Link
//                       href="/dashboard/examiner/submissions"
//                       className="text-xs font-medium text-accent-sky hover:underline"
//                     >
//                       Review
//                     </Link>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Card>
//   );
// }






// "use client";

// import { ClipboardCheck } from "lucide-react";
// import Link from "next/link";

// import { Card } from "@/components/ui/Card";
// import { cn } from "@/lib/utils";
// import { useSubmissions } from "@/hooks/useSubmissions";
// import type { GradingStatus } from "@/types/submission";

// const STATUS_LABEL: Record<GradingStatus, string> = {
//   FULLY_AUTO_GRADED: "Auto-Graded",
//   PENDING_REVIEW: "Pending Review",
//   FULLY_GRADED: "Graded",
// };

// const STATUS_CLASS: Record<GradingStatus, string> = {
//   FULLY_AUTO_GRADED: "bg-accent-teal/10 text-accent-teal",
//   PENDING_REVIEW: "bg-accent-amber/10 text-accent-amber",
//   FULLY_GRADED: "bg-accent-violet/10 text-accent-violet",
// };

// const RING_HEX: Record<GradingStatus, string> = {
//   FULLY_AUTO_GRADED: "#14B8A6",
//   PENDING_REVIEW: "#F5A623",
//   FULLY_GRADED: "#8B7FE8",
// };

// const TABLE_LIMIT = 5;
// const SAMPLE_LIMIT = 20;

// function formatSubmittedAt(iso: string | null): string {
//   if (!iso) return "—";
//   return new Date(iso).toLocaleString(undefined, {
//     month: "short",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// function GradingRing({ autoGraded, pending, graded }: { autoGraded: number; pending: number; graded: number }) {
//   const total = autoGraded + pending + graded;
//   const r = 30;
//   const circumference = 2 * Math.PI * r;

//   if (total === 0) {
//     return (
//       <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0">
//         <circle cx="38" cy="38" r={r} fill="none" stroke="#1E4A66" strokeWidth="9" />
//       </svg>
//     );
//   }

//   const segments: { color: string; value: number }[] = [
//     { color: RING_HEX.FULLY_AUTO_GRADED, value: autoGraded },
//     { color: RING_HEX.PENDING_REVIEW, value: pending },
//     { color: RING_HEX.FULLY_GRADED, value: graded },
//   ];

//   let offset = 0;
//   return (
//     <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0 -rotate-90">
//       <circle cx="38" cy="38" r={r} fill="none" stroke="#0B2135" strokeWidth="9" />
//       {segments.map((seg, i) => {
//         if (seg.value === 0) return null;
//         const length = (seg.value / total) * circumference;
//         const dasharray = `${length} ${circumference - length}`;
//         const dashoffset = -offset;
//         offset += length;
//         return (
//           <circle
//             key={i}
//             cx="38"
//             cy="38"
//             r={r}
//             fill="none"
//             stroke={seg.color}
//             strokeWidth="9"
//             strokeLinecap="butt"
//             strokeDasharray={dasharray}
//             strokeDashoffset={dashoffset}
//             className="transition-all duration-500 ease-out"
//           />
//         );
//       })}
//     </svg>
//   );
// }

// export function RecentSubmissionsCard() {
//   const { items, isLoading, stats } = useSubmissions({ page: 1, limit: SAMPLE_LIMIT });
//   const visibleItems = items.slice(0, TABLE_LIMIT);

//   return (
//     <Card interactive className="p-5 sm:p-6">
//       <div className="mb-5 flex items-center justify-between">
//         <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
//           <ClipboardCheck className="h-4 w-4 text-accent-sky" />
//           Recent Submissions
//         </p>
//         <Link
//           href="/dashboard/examiner/submissions"
//           className="text-xs font-medium text-accent-sky transition-colors hover:text-accent-skyHover hover:underline"
//         >
//           View all
//         </Link>
//       </div>

//       {isLoading ? (
//         <div className="space-y-3">
//           <div className="h-20 animate-pulse rounded-xl bg-surface-muted" />
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
//           ))}
//         </div>
//       ) : items.length === 0 ? (
//         <p className="py-8 text-center text-sm text-muted">No submissions yet.</p>
//       ) : (
//         <>
//           {/* Grading status breakdown — real counts from the fetched sample */}
//           <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-surface-muted/60 p-4 sm:flex-row">
//             <GradingRing autoGraded={stats.autoGradedCount} pending={stats.pendingCount} graded={stats.gradedCount} />
//             <div className="flex flex-1 flex-wrap gap-x-6 gap-y-2">
//               <div>
//                 <p className="flex items-center gap-1.5 text-xs text-muted">
//                   <span className="h-2 w-2 rounded-full" style={{ background: RING_HEX.FULLY_AUTO_GRADED }} />
//                   Auto-Graded
//                 </p>
//                 <p className="font-mono text-lg font-bold tabular-nums text-paper">{stats.autoGradedCount}</p>
//               </div>
//               <div>
//                 <p className="flex items-center gap-1.5 text-xs text-muted">
//                   <span className="h-2 w-2 rounded-full" style={{ background: RING_HEX.PENDING_REVIEW }} />
//                   Pending Review
//                 </p>
//                 <p className="font-mono text-lg font-bold tabular-nums text-paper">{stats.pendingCount}</p>
//               </div>
//               <div>
//                 <p className="flex items-center gap-1.5 text-xs text-muted">
//                   <span className="h-2 w-2 rounded-full" style={{ background: RING_HEX.FULLY_GRADED }} />
//                   Graded
//                 </p>
//                 <p className="font-mono text-lg font-bold tabular-nums text-paper">{stats.gradedCount}</p>
//               </div>
//               <p className="w-full text-[11px] text-muted">
//                 Based on the last {stats.sampleSize} submission{stats.sampleSize === 1 ? "" : "s"} · {stats.totalSubmissions} total
//               </p>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
//                   <th className="pb-2.5 font-medium">Student</th>
//                   <th className="pb-2.5 font-medium">Exam</th>
//                   <th className="pb-2.5 font-medium">Submitted</th>
//                   <th className="pb-2.5 font-medium">Status</th>
//                   <th className="pb-2.5" />
//                 </tr>
//               </thead>
//               <tbody>
//                 {visibleItems.map((item) => (
//                   <tr key={item.id} className="group border-b border-border/60 last:border-0">
//                     <td className="py-3 pr-3">
//                       <p className="truncate text-paper">{item.studentName}</p>
//                       <p className="truncate text-xs text-muted">{item.studentEmail}</p>
//                     </td>
//                     <td className="py-3 pr-3">
//                       <p className="truncate text-paper">{item.examTitle}</p>
//                       <p className="text-xs text-muted">{item.examSubject}</p>
//                     </td>
//                     <td className="whitespace-nowrap py-3 pr-3 font-mono text-xs text-muted">
//                       {formatSubmittedAt(item.submittedAt)}
//                     </td>
//                     <td className="py-3 pr-3">
//                       <span
//                         className={cn(
//                           "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
//                           STATUS_CLASS[item.gradingStatus]
//                         )}
//                       >
//                         {STATUS_LABEL[item.gradingStatus]}
//                       </span>
//                       {item.pendingCount > 0 && (
//                         <span className="ml-1.5 font-mono text-[11px] text-accent-amber">{item.pendingCount} left</span>
//                       )}
//                     </td>
//                     <td className="py-3 text-right">
//                       <Link
//                         href="/dashboard/examiner/submissions"
//                         className="text-xs font-medium text-accent-sky opacity-70 transition-opacity hover:underline group-hover:opacity-100"
//                       >
//                         Review
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </Card>
//   );
// }




"use client";

import { ClipboardCheck } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useSubmissions } from "@/hooks/useSubmissions";
import type { GradingStatus } from "@/types/submission";

const STATUS_LABEL: Record<GradingStatus, string> = {
  FULLY_AUTO_GRADED: "Auto-Graded",
  PENDING_REVIEW: "Pending Review",
  FULLY_GRADED: "Graded",
};

const STATUS_CLASS: Record<GradingStatus, string> = {
  FULLY_AUTO_GRADED: "bg-accent-teal/10 text-accent-teal",
  PENDING_REVIEW: "bg-accent-amber/10 text-accent-amber",
  FULLY_GRADED: "bg-accent-violet/10 text-accent-violet",
};

const RING_HEX: Record<GradingStatus, string> = {
  FULLY_AUTO_GRADED: "#14B8A6",
  PENDING_REVIEW: "#F5A623",
  FULLY_GRADED: "#8B7FE8",
};

const TABLE_LIMIT = 5;
const SAMPLE_LIMIT = 20;

function formatSubmittedAt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GradingRing({ autoGraded, pending, graded }: { autoGraded: number; pending: number; graded: number }) {
  const total = autoGraded + pending + graded;
  const r = 30;
  const circumference = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#1E4A66" strokeWidth="9" />
      </svg>
    );
  }

  const segments: { color: string; value: number }[] = [
    { color: RING_HEX.FULLY_AUTO_GRADED, value: autoGraded },
    { color: RING_HEX.PENDING_REVIEW, value: pending },
    { color: RING_HEX.FULLY_GRADED, value: graded },
  ];

  let offset = 0;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0 -rotate-90">
      <circle cx="38" cy="38" r={r} fill="none" stroke="#0B2135" strokeWidth="9" />
      {segments.map((seg, i) => {
        if (seg.value === 0) return null;
        const length = (seg.value / total) * circumference;
        const dasharray = `${length} ${circumference - length}`;
        const dashoffset = -offset;
        offset += length;
        return (
          <circle
            key={i}
            cx="38"
            cy="38"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="9"
            strokeLinecap="butt"
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            className="transition-all duration-500 ease-out"
          />
        );
      })}
    </svg>
  );
}

export function RecentSubmissionsCard() {
  const { items, isLoading, stats } = useSubmissions({ page: 1, limit: SAMPLE_LIMIT });
  const visibleItems = items.slice(0, TABLE_LIMIT);

  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
          <ClipboardCheck className="h-4 w-4 text-accent-sky" />
          Recent Submissions
        </p>
        <Link
          href="/dashboard/examiner/submissions"
          className="text-xs font-medium text-accent-sky transition-colors hover:text-accent-skyHover hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-xl bg-surface-muted" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No submissions yet.</p>
      ) : (
        <>
          {/* Grading status breakdown — real counts from the fetched sample */}
          <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-surface-muted/60 p-4 sm:flex-row">
            <GradingRing autoGraded={stats.autoGradedCount} pending={stats.pendingCount} graded={stats.gradedCount} />
            <div className="flex flex-1 flex-wrap gap-x-6 gap-y-2">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: RING_HEX.FULLY_AUTO_GRADED }} />
                  Auto-Graded
                </p>
                <p className="font-mono text-lg font-bold tabular-nums text-paper">{stats.autoGradedCount}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: RING_HEX.PENDING_REVIEW }} />
                  Pending Review
                </p>
                <p className="font-mono text-lg font-bold tabular-nums text-paper">{stats.pendingCount}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: RING_HEX.FULLY_GRADED }} />
                  Graded
                </p>
                <p className="font-mono text-lg font-bold tabular-nums text-paper">{stats.gradedCount}</p>
              </div>
              <p className="w-full text-[11px] text-muted">
                Based on the last {stats.sampleSize} submission{stats.sampleSize === 1 ? "" : "s"} · {stats.totalSubmissions} total
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="pb-2.5 font-medium">Student</th>
                  <th className="pb-2.5 font-medium">Exam</th>
                  <th className="pb-2.5 font-medium">Submitted</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5" />
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id} className="group border-b border-border/60 last:border-0">
                    <td className="py-3 pr-3">
                      <p className="truncate text-paper">{item.studentName}</p>
                      <p className="truncate text-xs text-muted">{item.studentEmail}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="truncate text-paper">{item.examTitle}</p>
                      <p className="text-xs text-muted">{item.examSubject}</p>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-3 font-mono text-xs text-muted">
                      {formatSubmittedAt(item.submittedAt)}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          STATUS_CLASS[item.gradingStatus]
                        )}
                      >
                        {STATUS_LABEL[item.gradingStatus]}
                      </span>
                      {item.pendingCount > 0 && (
                        <span className="ml-1.5 font-mono text-[11px] text-accent-amber">{item.pendingCount} left</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href="/dashboard/examiner/submissions"
                        className="text-xs font-medium text-accent-sky opacity-70 transition-opacity hover:underline group-hover:opacity-100"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
