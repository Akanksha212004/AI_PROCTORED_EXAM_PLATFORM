// "use client";

// import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";

// import { Badge } from "@/components/ui/Badge";
// import type { Exam, ExamPagination } from "@/types/exam";

// interface Props {
//   exams: Exam[];
//   isLoading: boolean;
//   pagination?: ExamPagination;
//   onView: (e: Exam) => void;
//   onEdit: (e: Exam) => void;
//   onDelete: (e: Exam) => void;
// }

// function examStatus(exam: Exam): { label: string; tone: "sky" | "teal" | "neutral" | "rose" } {
//   const now = Date.now();
//   const start = new Date(exam.startTime).getTime();
//   const end = new Date(exam.endTime).getTime();
//   if (now < start) return { label: "Upcoming", tone: "sky" };
//   if (now >= start && now <= end) return { label: "Active", tone: "teal" };
//   return { label: "Ended", tone: "neutral" };
// }

// function formatDateTime(iso: string) {
//   const d = new Date(iso);
//   return { date: d.toLocaleDateString(), time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
// }

// export function ExamTable({ exams, isLoading, pagination, onView, onEdit, onDelete }: Props) {
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-20 text-muted">
//         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//         Loading exams...
//       </div>
//     );
//   }

//   if (exams.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
//         <p className="font-display text-lg text-paper">No exams found</p>
//         <p className="max-w-sm text-sm text-muted">
//           Try adjusting your filters, or create your first exam with the button above.
//         </p>
//       </div>
//     );
//   }

//   const rowOffset = pagination ? (pagination.page - 1) * pagination.limit : 0;

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full min-w-[980px] text-left text-sm">
//         <thead>
//           <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
//             <th className="py-3 pr-4 font-medium">S.NO.</th>
//             <th className="py-3 pr-4 font-medium">Title</th>
//             <th className="py-3 pr-4 font-medium">Subject</th>
//             <th className="py-3 pr-4 font-medium">Duration</th>
//             <th className="py-3 pr-4 font-medium">Window</th>
//             <th className="py-3 pr-4 font-medium">Status</th>
//             <th className="py-3 pr-4 font-medium">Questions</th>
//             <th className="py-3 pr-2 text-right font-medium">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {exams.map((exam, i) => {
//             const status = examStatus(exam);
//             const start = formatDateTime(exam.startTime);
//             const end = formatDateTime(exam.endTime);
//             const questionCount =
//               exam.examQuestions.length > 0
//                 ? `${exam.examQuestions.length} curated`
//                 : exam.selectionRules.length > 0
//                 ? `${exam.selectionRules.reduce((sum, r) => sum + r.count, 0)} via rules`
//                 : "Not configured";

//             return (
//               <tr key={exam.id} className="border-b border-border/60 hover:bg-white/[0.03]">
//                 <td className="py-3.5 pr-4 text-muted">{rowOffset + i + 1}</td>
//                 <td className="py-3.5 pr-4 text-paper">{exam.title}</td>
//                 <td className="py-3.5 pr-4 text-muted">{exam.subject}</td>
//                 <td className="py-3.5 pr-4 text-muted">{exam.durationMinutes} min</td>
//                 <td className="py-3.5 pr-4 text-muted">
//                   <div className="flex flex-col text-xs">
//                     <span>
//                       {start.date} {start.time}
//                     </span>
//                     <span className="text-muted/70">
//                       to {end.date} {end.time}
//                     </span>
//                   </div>
//                 </td>
//                 <td className="py-3.5 pr-4">
//                   <Badge tone={status.tone}>{status.label}</Badge>
//                 </td>
//                 <td className="py-3.5 pr-4 text-muted">{questionCount}</td>
//                 <td className="py-3.5 pr-2">
//                   <div className="flex justify-end gap-1">
//                     <button
//                       onClick={() => onView(exam)}
//                       aria-label="View exam"
//                       className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
//                     >
//                       <Eye className="h-4 w-4" />
//                     </button>
//                     <button
//                       onClick={() => onEdit(exam)}
//                       aria-label="Edit exam"
//                       className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </button>
//                     <button
//                       onClick={() => onDelete(exam)}
//                       aria-label="Delete exam"
//                       className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-rose"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }





"use client";

import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { Exam, ExamPagination, ExamStatus } from "@/types/exam";

interface Props {
  exams: Exam[];
  isLoading: boolean;
  pagination?: ExamPagination;
  onView: (e: Exam) => void;
  onEdit: (e: Exam) => void;
  onDelete: (e: Exam) => void;
}

function timeWindowStatus(exam: Exam): { label: string; tone: "sky" | "teal" | "neutral" | "rose" } {
  const now = Date.now();
  const start = new Date(exam.startTime).getTime();
  const end = new Date(exam.endTime).getTime();
  if (now < start) return { label: "Upcoming", tone: "sky" };
  if (now >= start && now <= end) return { label: "Active", tone: "teal" };
  return { label: "Ended", tone: "neutral" };
}

function lifecycleTone(status: ExamStatus): "amber" | "teal" | "rose" {
  if (status === "PUBLISHED") return "teal";
  if (status === "CANCELLED") return "rose";
  return "amber"; // DRAFT
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return { date: d.toLocaleDateString(), time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
}

export function ExamTable({ exams, isLoading, pagination, onView, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading exams...
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-display text-lg text-paper">No exams found</p>
        <p className="max-w-sm text-sm text-muted">
          Try adjusting your filters, or create your first exam with the button above.
        </p>
      </div>
    );
  }

  const rowOffset = pagination ? (pagination.page - 1) * pagination.limit : 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="py-3 pr-4 font-medium">S.NO.</th>
            <th className="py-3 pr-4 font-medium">Title</th>
            <th className="py-3 pr-4 font-medium">Subject</th>
            <th className="py-3 pr-4 font-medium">Duration</th>
            <th className="py-3 pr-4 font-medium">Marks</th>
            <th className="py-3 pr-4 font-medium">Window</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-4 font-medium">Questions</th>
            <th className="py-3 pr-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam, i) => {
            const timeStatus = timeWindowStatus(exam);
            const start = formatDateTime(exam.startTime);
            const end = formatDateTime(exam.endTime);
            const questionCount =
              exam.examQuestions.length > 0
                ? `${exam.examQuestions.length} curated`
                : exam.selectionRules.length > 0
                ? `${exam.selectionRules.reduce((sum, r) => sum + r.count, 0)} via rules`
                : "Not configured";

            return (
              <tr key={exam.id} className="border-b border-border/60 hover:bg-white/[0.03]">
                <td className="py-3.5 pr-4 text-muted">{rowOffset + i + 1}</td>
                <td className="py-3.5 pr-4 text-paper">{exam.title}</td>
                <td className="py-3.5 pr-4 text-muted">{exam.subject}</td>
                <td className="py-3.5 pr-4 text-muted">{exam.durationMinutes} min</td>
                <td className="py-3.5 pr-4 text-muted">
                  {exam.totalMarks} <span className="text-xs text-muted/70">(pass {exam.passingMarks})</span>
                </td>
                <td className="py-3.5 pr-4 text-muted">
                  <div className="flex flex-col text-xs">
                    <span>
                      {start.date} {start.time}
                    </span>
                    <span className="text-muted/70">
                      to {end.date} {end.time}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={lifecycleTone(exam.status)}>{exam.status}</Badge>
                    <Badge tone={timeStatus.tone}>{timeStatus.label}</Badge>
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-muted">{questionCount}</td>
                <td className="py-3.5 pr-2">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onView(exam)}
                      aria-label="View exam"
                      className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(exam)}
                      aria-label="Edit exam"
                      className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(exam)}
                      aria-label="Delete exam"
                      className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-rose"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
