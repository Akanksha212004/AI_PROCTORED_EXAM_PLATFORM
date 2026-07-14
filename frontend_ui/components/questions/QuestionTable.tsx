// "use client";

// import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";

// import { Badge, difficultyTone, questionTypeLabel } from "@/components/ui/Badge";
// import type { Question } from "@/types/question";

// interface Props {
//   questions: Question[];
//   isLoading: boolean;
//   page: number;
//   limit: number;
//   onView: (q: Question) => void;
//   onEdit: (q: Question) => void;
//   onDelete: (q: Question) => void;
// }

// function truncate(text: string, max = 70) {
//   return text.length > max ? `${text.slice(0, max).trim()}…` : text;
// }

// export function QuestionTable({ questions, isLoading, page, limit, onView, onEdit, onDelete }: Props) {
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-20 text-muted">
//         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//         Loading questions...
//       </div>
//     );
//   }

//   if (questions.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
//         <p className="font-display text-lg text-paper">No questions found</p>
//         <p className="max-w-sm text-sm text-muted">
//           Try adjusting your filters, or create your first question with the button above.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full min-w-[980px] text-left text-sm">
//         <thead>
//           <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
//             <th className="py-3 pr-4 font-medium">S.No.</th>
//             <th className="py-3 pr-4 font-medium">Question</th>
//             <th className="py-3 pr-4 font-medium">Subject</th>
//             <th className="py-3 pr-4 font-medium">Type</th>
//             <th className="py-3 pr-4 font-medium">Difficulty</th>
//             <th className="py-3 pr-4 font-medium">Marks</th>
//             <th className="py-3 pr-4 font-medium">Neg. Marks</th>
//             <th className="py-3 pr-4 font-medium">Created</th>
//             <th className="py-3 pr-4 font-medium">Modified</th>
//             <th className="py-3 pr-2 text-right font-medium">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {questions.map((q, index) => (
//             <tr key={q.id} className="border-b border-border/60 hover:bg-white/[0.03]">
//               <td className="py-3.5 pr-4 text-muted">
//                 {(page - 1) * limit + index + 1}
//               </td>
//               <td className="py-3.5 pr-4 text-paper">{truncate(q.questionText)}</td>
//               <td className="py-3.5 pr-4 text-muted">{q.subject}</td>
//               <td className="py-3.5 pr-4">
//                 <Badge tone="sky">{questionTypeLabel(q.questionType)}</Badge>
//               </td>
//               <td className="py-3.5 pr-4">
//                 <Badge tone={difficultyTone(q.difficultyLevel)}>
//                   {q.difficultyLevel.charAt(0) + q.difficultyLevel.slice(1).toLowerCase()}
//                 </Badge>
//               </td>
//               <td className="py-3.5 pr-4 text-paper">{q.marks}</td>
//               <td className="py-3.5 pr-4 text-muted">{q.negativeMarks}</td>
//               <td className="py-3.5 pr-4 text-muted">
//                 <div className="flex flex-col">
//                   <span>{new Date(q.createdAt).toLocaleDateString()}</span>
//                   <span className="text-xs text-muted/70">
//                     {new Date(q.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                   </span>
//                 </div>
//               </td>
//               <td className="py-3.5 pr-4 text-muted">
//                 <div className="flex flex-col">
//                   <span>{new Date(q.updatedAt).toLocaleDateString()}</span>
//                   <span className="text-xs text-muted/70">
//                     {new Date(q.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                   </span>
//                 </div>
//               </td>
//               <td className="py-3.5 pr-2">
//                 <div className="flex justify-end gap-1">
//                   <button
//                     onClick={() => onView(q)}
//                     aria-label="View question"
//                     className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
//                   >
//                     <Eye className="h-4 w-4" />
//                   </button>
//                   <button
//                     onClick={() => onEdit(q)}
//                     aria-label="Edit question"
//                     className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
//                   >
//                     <Pencil className="h-4 w-4" />
//                   </button>
//                   <button
//                     onClick={() => onDelete(q)}
//                     aria-label="Delete question"
//                     className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-rose"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }




"use client";

import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";

import { Badge, difficultyTone, questionTypeLabel } from "@/components/ui/Badge";
import type { Question, QuestionPagination } from "@/types/question";

interface Props {
  questions: Question[];
  isLoading: boolean;
  /** Optional — used only for S.NO. row numbering across pages. Not
   * required; passing it fixes the "Property 'pagination' does not
   * exist" TS error if your page.tsx already passes it in. */
  page: number;
  limit: number;
  onView: (q: Question) => void;
  onEdit: (q: Question) => void;
  onDelete: (q: Question) => void;
}

function truncate(text: string, max = 70) {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export function QuestionTable({ questions, isLoading, page, limit, onView, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading questions...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-display text-lg text-paper">No questions found</p>
        <p className="max-w-sm text-sm text-muted">
          Try adjusting your filters, or create your first question with the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="py-3 pr-4 font-medium">S.No.</th>
            <th className="py-3 pr-4 font-medium">Question</th>
            <th className="py-3 pr-4 font-medium">Subject</th>
            <th className="py-3 pr-4 font-medium">Type</th>
            <th className="py-3 pr-4 font-medium">Difficulty</th>
            <th className="py-3 pr-4 font-medium">Marks</th>
            <th className="py-3 pr-4 font-medium">Neg. Marks</th>
            <th className="py-3 pr-4 font-medium">Created</th>
            <th className="py-3 pr-4 font-medium">Modified</th>
            <th className="py-3 pr-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, index) => (
            <tr key={q.id} className="border-b border-border/60 hover:bg-white/[0.03]">
              <td className="py-3.5 pr-4 text-muted">
                {(page - 1) * limit + index + 1}
              </td>
              <td className="py-3.5 pr-4 text-paper">{truncate(q.questionText)}</td>
              <td className="py-3.5 pr-4 text-muted">{q.subject}</td>
              <td className="py-3.5 pr-4">
                <Badge tone="sky">{questionTypeLabel(q.questionType)}</Badge>
              </td>
              <td className="py-3.5 pr-4">
                <Badge tone={difficultyTone(q.difficultyLevel)}>
                  {q.difficultyLevel.charAt(0) + q.difficultyLevel.slice(1).toLowerCase()}
                </Badge>
              </td>
              <td className="py-3.5 pr-4 text-paper">{q.marks}</td>
              <td className="py-3.5 pr-4 text-muted">{q.negativeMarks}</td>
              <td className="py-3.5 pr-4 text-muted">
                <div className="flex flex-col">
                  <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs text-muted/70">
                    {new Date(q.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </td>
              <td className="py-3.5 pr-4 text-muted">
                <div className="flex flex-col">
                  <span>{new Date(q.updatedAt).toLocaleDateString()}</span>
                  <span className="text-xs text-muted/70">
                    {new Date(q.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </td>
              <td className="py-3.5 pr-2">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onView(q)}
                    aria-label="View question"
                    className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(q)}
                    aria-label="Edit question"
                    className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-sky"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(q)}
                    aria-label="Delete question"
                    className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-accent-rose"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
