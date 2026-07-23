// "use client";

// import { ArrowLeft, Award, Clock, ListChecks } from "lucide-react";
// import Link from "next/link";
// import { useParams } from "next/navigation";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { Card } from "@/components/ui/Card";
// import { useStudentDetail, type ExamHistoryItem, type SessionStatus } from "@/hooks/useStudentDetail";
// import { cn } from "@/lib/utils";

// export default function StudentDetailPage() {
//   return (
//     <RoleGuard allowedRole="EXAMINER">
//       <DashboardShell>
//         <StudentDetailContent />
//       </DashboardShell>
//     </RoleGuard>
//   );
// }

// const STATUS_LABEL: Record<SessionStatus, string> = {
//   IN_PROGRESS: "In progress",
//   SUBMITTED: "Submitted",
//   AUTO_SUBMITTED: "Auto-submitted",
//   EXPIRED: "Expired",
// };

// const STATUS_CLASS: Record<SessionStatus, string> = {
//   IN_PROGRESS: "bg-accent-amber/10 text-accent-amber",
//   SUBMITTED: "bg-accent-teal/10 text-accent-teal",
//   AUTO_SUBMITTED: "bg-accent-sky/10 text-accent-sky",
//   EXPIRED: "bg-accent-rose/10 text-accent-rose",
// };

// function formatDate(iso: string | null): string {
//   if (!iso) return "—";
//   return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
// }

// function StudentDetailContent() {
//   const params = useParams<{ studentId: string }>();
//   const { student, isLoading, notFound } = useStudentDetail(params.studentId);

//   if (notFound) {
//     return (
//       <div className="flex flex-col items-center gap-4 py-24 text-center">
//         <p className="text-paper">This student hasn&apos;t taken any of your exams.</p>
//         <Link href="/dashboard/examiner/students" className="text-sm text-accent-sky hover:underline">
//           ← Back to Students
//         </Link>
//       </div>
//     );
//   }

//   if (isLoading || !student) {
//     return (
//       <div className="space-y-6">
//         <div className="h-8 w-48 animate-pulse rounded bg-surface-muted" />
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//           {[...Array(3)].map((_, i) => (
//             <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-muted" />
//           ))}
//         </div>
//         <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <Link
//           href="/dashboard/examiner/students"
//           className="mb-3 inline-flex items-center gap-1.5 text-sm text-paper/60 transition-colors hover:text-paper"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Back to Students
//         </Link>
//         <div className="flex flex-wrap items-center gap-3">
//           <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
//             {student.name}
//           </h1>
//           <span
//             className={cn(
//               "rounded-full px-2.5 py-1 text-xs font-medium",
//               student.isActive ? "bg-accent-teal/10 text-accent-teal" : "bg-paper/5 text-paper/40"
//             )}
//           >
//             {student.isActive ? "Active" : "Inactive"}
//           </span>
//         </div>
//         <p className="mt-1 text-sm text-paper/60">{student.email}</p>
//       </div>

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//         <Card className="flex items-center gap-4">
//           <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10 text-accent-sky">
//             <ListChecks className="h-5 w-5" />
//           </span>
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">Exams Taken</p>
//             <p className="text-xl font-semibold text-paper">{student.examsTaken}</p>
//           </div>
//         </Card>
//         <Card className="flex items-center gap-4">
//           <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-violet/10 text-accent-violet">
//             <Award className="h-5 w-5" />
//           </span>
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">Average Score</p>
//             <p className="text-xl font-semibold text-paper">
//               {student.averageScore !== null ? `${student.averageScore}%` : "—"}
//             </p>
//           </div>
//         </Card>
//         <Card className="flex items-center gap-4">
//           <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-amber/10 text-accent-amber">
//             <Clock className="h-5 w-5" />
//           </span>
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">Last Active</p>
//             <p className="text-xl font-semibold text-paper">{formatDate(student.lastActive)}</p>
//           </div>
//         </Card>
//       </div>

//       <Card className="overflow-hidden p-0">
//         <div className="border-b border-border px-5 py-4">
//           <p className="font-display text-base font-semibold text-paper">Exam History</p>
//         </div>
//         {student.examHistory.length === 0 ? (
//           <p className="px-5 py-10 text-center text-sm text-muted">No exam attempts yet.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[640px] text-left text-sm">
//               <thead>
//                 <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
//                   <th className="px-5 py-3 font-medium">Exam</th>
//                   <th className="px-5 py-3 font-medium">Status</th>
//                   <th className="px-5 py-3 font-medium">Score</th>
//                   <th className="px-5 py-3 font-medium">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {student.examHistory.map((item: ExamHistoryItem) => (
//                   <tr key={item.sessionId} className="border-b border-border/60 last:border-0">
//                     <td className="px-5 py-3.5">
//                       <p className="font-medium text-paper">{item.examTitle}</p>
//                       <p className="text-xs text-muted">{item.subject}</p>
//                     </td>
//                     <td className="px-5 py-3.5">
//                       <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_CLASS[item.status])}>
//                         {STATUS_LABEL[item.status]}
//                       </span>
//                     </td>
//                     <td className="px-5 py-3.5 text-paper/80">
//                       {item.score !== null ? `${item.score}% (${item.totalMarks}/${item.maxMarks})` : "—"}
//                     </td>
//                     <td className="px-5 py-3.5 font-mono text-xs text-muted">{formatDate(item.startTime)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }






"use client";

import { ArrowLeft, Award, Clock, ListChecks } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { useStudentDetail, type ExamHistoryItem, type SessionStatus } from "@/hooks/useStudentDetail";
import { cn } from "@/lib/utils";

export default function StudentDetailPage() {
  return (
    <RoleGuard allowedRole="EXAMINER">
      <DashboardShell>
        <StudentDetailContent />
      </DashboardShell>
    </RoleGuard>
  );
}

const STATUS_LABEL: Record<SessionStatus, string> = {
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  AUTO_SUBMITTED: "Auto-submitted",
  EXPIRED: "Expired",
};

const STATUS_CLASS: Record<SessionStatus, string> = {
  IN_PROGRESS: "bg-accent-amber/10 text-accent-amber",
  SUBMITTED: "bg-accent-teal/10 text-accent-teal",
  AUTO_SUBMITTED: "bg-accent-sky/10 text-accent-sky",
  EXPIRED: "bg-accent-rose/10 text-accent-rose",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function StudentDetailContent() {
  const params = useParams<{ studentId: string }>();
  const { student, isLoading, notFound } = useStudentDetail(params.studentId);

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-paper">This student hasn&apos;t taken any of your exams.</p>
        <Link href="/dashboard/examiner/students" className="text-sm text-accent-sky hover:underline">
          ← Back to Students
        </Link>
      </div>
    );
  }

  if (isLoading || !student) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/examiner/students"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-paper/60 transition-colors hover:text-paper"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
            {student.name}
          </h1>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              student.isActive ? "bg-accent-teal/10 text-accent-teal" : "bg-paper/5 text-paper/40"
            )}
          >
            {student.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="mt-1 text-sm text-paper/60">{student.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10 text-accent-sky">
            <ListChecks className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Exams Taken</p>
            <p className="text-xl font-semibold text-paper">{student.examsTaken}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-violet/10 text-accent-violet">
            <Award className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Average Score</p>
            <p className="text-xl font-semibold text-paper">
              {student.averageScore !== null ? `${student.averageScore}%` : "—"}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-amber/10 text-accent-amber">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Last Active</p>
            <p className="text-xl font-semibold text-paper">{formatDate(student.lastActive)}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-5 py-4">
          <p className="font-display text-base font-semibold text-paper">Exam History</p>
        </div>
        {student.examHistory.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No exam attempts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Exam</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {student.examHistory.map((item: ExamHistoryItem) => (
                  <tr key={item.sessionId} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-paper">{item.examTitle}</p>
                      <p className="text-xs text-muted">{item.subject}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_CLASS[item.status])}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-paper/80">
                      {item.score !== null ? `${item.score}% (${item.totalMarks}/${item.maxMarks})` : "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted">{formatDate(item.startTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
