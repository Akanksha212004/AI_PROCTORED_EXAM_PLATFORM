// "use client";

// import { Dialog } from "@/components/ui/Dialog";
// import { Badge } from "@/components/ui/Badge";
// import { questionTypeLabel } from "@/components/ui/Badge";
// import type { Exam } from "@/types/exam";

// interface Props {
//   exam: Exam | null;
//   onClose: () => void;
// }

// export function ExamViewModal({ exam, onClose }: Props) {
//   if (!exam) return null;

//   return (
//     <Dialog open={Boolean(exam)} onClose={onClose} title={exam.title} size="lg">
//       <div className="space-y-5">
//         <div className="flex flex-wrap gap-2">
//           <Badge tone="neutral">{exam.subject}</Badge>
//           <Badge tone="sky">{exam.durationMinutes} min</Badge>
//           <Badge tone="neutral">{exam.randomizationMode.replace(/_/g, " ")}</Badge>
//           {exam.negativeMarkingEnabled && <Badge tone="rose">Negative marking on</Badge>}
//           {exam.webcamMonitoringEnabled && <Badge tone="teal">Webcam monitoring on</Badge>}
//           {exam.multiFaceDetectionEnabled && <Badge tone="teal">Multi-face detection on</Badge>}
//           {exam.fullScreenModeEnabled && <Badge tone="teal">Full-screen enforced</Badge>}
//         </div>

//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">Start</p>
//             <p className="mt-1 text-paper">{new Date(exam.startTime).toLocaleString()}</p>
//           </div>
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">End</p>
//             <p className="mt-1 text-paper">{new Date(exam.endTime).toLocaleString()}</p>
//           </div>
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">Gaze Sensitivity</p>
//             <p className="mt-1 text-paper">{exam.gazeSensitivity}</p>
//           </div>
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">Max Tab-Switch Warnings</p>
//             <p className="mt-1 text-paper">{exam.maxTabSwitchWarnings}</p>
//           </div>
//         </div>

//         {exam.selectionRules.length > 0 && (
//           <div>
//             <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Selection Rules</p>
//             <ul className="space-y-1.5">
//               {exam.selectionRules.map((r) => (
//                 <li key={r.id} className="rounded-lg border border-border bg-surface-muted px-3.5 py-2 text-sm text-paper">
//                   Pick <span className="text-accent-sky">{r.count}</span>
//                   {r.difficultyLevel ? ` ${r.difficultyLevel}` : ""}
//                   {r.questionType ? ` ${questionTypeLabel(r.questionType)}` : " questions"}
//                   {r.subject ? ` from ${r.subject}` : ""}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {exam.examQuestions.length > 0 && (
//           <div>
//             <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
//               Curated Pool ({exam.examQuestions.length})
//             </p>
//             <ul className="max-h-48 space-y-1.5 overflow-y-auto">
//               {exam.examQuestions.map((p) => (
//                 <li key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2 text-sm">
//                   <span className="truncate text-paper">{p.question.questionText}</span>
//                   <Badge tone="neutral">{p.question.subject}</Badge>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         <div className="flex justify-between border-t border-border pt-4 text-xs text-muted">
//           <span>Created {new Date(exam.createdAt).toLocaleString()}</span>
//           <span>Updated {new Date(exam.updatedAt).toLocaleString()}</span>
//         </div>
//       </div>
//     </Dialog>
//   );
// }






// "use client";

// import { Dialog } from "@/components/ui/Dialog";
// import { Badge } from "@/components/ui/Badge";
// import { questionTypeLabel } from "@/components/ui/Badge";
// import type { Exam } from "@/types/exam";

// interface Props {
//   exam: Exam | null;
//   onClose: () => void;
// }

// export function ExamViewModal({ exam, onClose }: Props) {
//   if (!exam) return null;

//   return (
//     <Dialog open={Boolean(exam)} onClose={onClose} title={exam.title} size="lg">
//       <div className="space-y-5">
//         <div className="flex flex-wrap gap-2">
//           <Badge tone="neutral">{exam.subject}</Badge>
//           <Badge tone="sky">{exam.durationMinutes} min</Badge>
//           <Badge tone="neutral">{exam.randomizationMode.replace(/_/g, " ")}</Badge>
//           {exam.negativeMarkingEnabled && <Badge tone="rose">Negative marking on</Badge>}
//           {exam.webcamMonitoringEnabled && <Badge tone="teal">Webcam monitoring on</Badge>}
//           {exam.multiFaceDetectionEnabled && <Badge tone="teal">Multi-face detection on</Badge>}
//           {exam.fullScreenModeEnabled && <Badge tone="teal">Full-screen enforced</Badge>}
//           {exam.audioMonitoringEnabled && (
//             <Badge tone="amber">Audio monitoring on (coming soon)</Badge>
//           )}
//         </div>

//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">Start</p>
//             <p className="mt-1 text-paper">{new Date(exam.startTime).toLocaleString()}</p>
//           </div>
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">End</p>
//             <p className="mt-1 text-paper">{new Date(exam.endTime).toLocaleString()}</p>
//           </div>
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">Gaze Sensitivity</p>
//             <p className="mt-1 text-paper">{exam.gazeSensitivity}</p>
//           </div>
//           <div>
//             <p className="text-xs uppercase tracking-wide text-muted">Max Tab-Switch Warnings</p>
//             <p className="mt-1 text-paper">{exam.maxTabSwitchWarnings}</p>
//           </div>
//         </div>

//         {exam.selectionRules.length > 0 && (
//           <div>
//             <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Selection Rules</p>
//             <ul className="space-y-1.5">
//               {exam.selectionRules.map((r) => (
//                 <li key={r.id} className="rounded-lg border border-border bg-surface-muted px-3.5 py-2 text-sm text-paper">
//                   Pick <span className="text-accent-sky">{r.count}</span>
//                   {r.difficultyLevel ? ` ${r.difficultyLevel}` : ""}
//                   {r.questionType ? ` ${questionTypeLabel(r.questionType)}` : " questions"}
//                   {r.subject ? ` from ${r.subject}` : ""}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {exam.examQuestions.length > 0 && (
//           <div>
//             <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
//               Curated Pool ({exam.examQuestions.length})
//             </p>
//             <ul className="max-h-48 space-y-1.5 overflow-y-auto">
//               {exam.examQuestions.map((p) => (
//                 <li key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2 text-sm">
//                   <span className="truncate text-paper">{p.question.questionText}</span>
//                   <Badge tone="neutral">{p.question.subject}</Badge>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         <div className="flex justify-between border-t border-border pt-4 text-xs text-muted">
//           <span>Created {new Date(exam.createdAt).toLocaleString()}</span>
//           <span>Updated {new Date(exam.updatedAt).toLocaleString()}</span>
//         </div>
//       </div>
//     </Dialog>
//   );
// }





"use client";

import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { questionTypeLabel } from "@/components/ui/Badge";
import type { Exam } from "@/types/exam";

interface Props {
  exam: Exam | null;
  onClose: () => void;
}

export function ExamViewModal({ exam, onClose }: Props) {
  if (!exam) return null;

  return (
    <Dialog open={Boolean(exam)} onClose={onClose} title={exam.title} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone={exam.status === "PUBLISHED" ? "teal" : exam.status === "CANCELLED" ? "rose" : "amber"}>
            {exam.status}
          </Badge>
          <Badge tone="neutral">{exam.subject}</Badge>
          <Badge tone="sky">{exam.durationMinutes} min</Badge>
          <Badge tone="sky">
            {exam.totalMarks} marks (pass {exam.passingMarks})
          </Badge>
          <Badge tone="neutral">{exam.randomizationMode.replace(/_/g, " ")}</Badge>
          {exam.negativeMarkingEnabled && <Badge tone="rose">Negative marking on</Badge>}
          {exam.webcamMonitoringEnabled && <Badge tone="teal">Webcam monitoring on</Badge>}
          {exam.multiFaceDetectionEnabled && <Badge tone="teal">Multi-face detection on</Badge>}
          {exam.fullScreenModeEnabled && <Badge tone="teal">Full-screen enforced</Badge>}
          {exam.audioMonitoringEnabled && (
            <Badge tone="amber">Audio monitoring on (coming soon)</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Start</p>
            <p className="mt-1 text-paper">{new Date(exam.startTime).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">End</p>
            <p className="mt-1 text-paper">{new Date(exam.endTime).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Gaze Sensitivity</p>
            <p className="mt-1 text-paper">{exam.gazeSensitivity}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Max Tab-Switch Warnings</p>
            <p className="mt-1 text-paper">{exam.maxTabSwitchWarnings}</p>
          </div>
        </div>

        {exam.selectionRules.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Selection Rules</p>
            <ul className="space-y-1.5">
              {exam.selectionRules.map((r) => (
                <li key={r.id} className="rounded-lg border border-border bg-surface-muted px-3.5 py-2 text-sm text-paper">
                  Pick <span className="text-accent-sky">{r.count}</span>
                  {r.difficultyLevel ? ` ${r.difficultyLevel}` : ""}
                  {r.questionType ? ` ${questionTypeLabel(r.questionType)}` : " questions"}
                  {r.subject ? ` from ${r.subject}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {exam.examQuestions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Curated Pool ({exam.examQuestions.length})
            </p>
            <ul className="max-h-48 space-y-1.5 overflow-y-auto">
              {exam.examQuestions.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2 text-sm">
                  <span className="truncate text-paper">{p.question.questionText}</span>
                  <Badge tone="neutral">{p.question.subject}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-between border-t border-border pt-4 text-xs text-muted">
          <span>Created {new Date(exam.createdAt).toLocaleString()}</span>
          <span>Updated {new Date(exam.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </Dialog>
  );
}
