// "use client";

// import { CheckCircle2, Circle, XCircle } from "lucide-react";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// import { Dialog } from "@/components/ui/Dialog";
// import { Button } from "@/components/ui/Button";
// import { Badge } from "@/components/ui/Badge";
// import { submissionService } from "@/services/submissionService";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import type { SubmissionDetail, SubmissionQuestionDetail } from "@/types/submission";

// interface Props {
//   sessionId: string | null;
//   onClose: () => void;
//   onGraded: () => void;
// }

// function ObjectiveAnswerView({ q }: { q: SubmissionQuestionDetail }) {
//   return (
//     <div className="space-y-1.5">
//       {q.options?.map((opt) => {
//         const wasSelected = q.selectedOptionIds.includes(opt.id);
//         return (
//           <div
//             key={opt.id}
//             className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm ${
//               opt.isCorrect
//                 ? "border-accent-teal/40 bg-accent-teal/10 text-paper"
//                 : wasSelected
//                 ? "border-accent-rose/40 bg-accent-rose/10 text-paper"
//                 : "border-border text-muted"
//             }`}
//           >
//             {opt.isCorrect ? (
//               <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-teal" />
//             ) : wasSelected ? (
//               <XCircle className="h-4 w-4 shrink-0 text-accent-rose" />
//             ) : (
//               <Circle className="h-4 w-4 shrink-0 text-muted" />
//             )}
//             {opt.optionText}
//             {wasSelected && <span className="ml-auto text-xs text-muted">(student&apos;s answer)</span>}
//           </div>
//         );
//       })}
//       <p className="pt-1 text-xs text-muted">
//         Auto-graded: <span className="text-paper">{q.marksAwarded ?? 0}</span> / {q.marksAllocated} marks
//       </p>
//     </div>
//   );
// }

// function SubjectiveGradingRow({
//   q,
//   onSave,
// }: {
//   q: SubmissionQuestionDetail;
//   onSave: (answerId: string, score: number, feedback: string) => Promise<void>;
// }) {
//   const [score, setScore] = useState(String(q.grading?.examinerScore ?? q.marksAwarded ?? ""));
//   const [feedback, setFeedback] = useState(q.grading?.feedback ?? "");
//   const [isSaving, setIsSaving] = useState(false);
//   const isGraded = q.grading?.status === "GRADED";

//   async function handleSave() {
//     const scoreNum = Number(score);
//     if (Number.isNaN(scoreNum) || scoreNum < 0) {
//       toast.error("Enter a valid non-negative score");
//       return;
//     }
//     if (scoreNum > q.marksAllocated) {
//       toast.error(`Score cannot exceed ${q.marksAllocated} marks`);
//       return;
//     }
//     if (!q.answerId) return;
//     setIsSaving(true);
//     try {
//       await onSave(q.answerId, scoreNum, feedback);
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   return (
//     <div className="space-y-3 rounded-lg border border-border bg-surface-muted p-4">
//       {q.submittedText && <p className="whitespace-pre-wrap text-sm text-paper">{q.submittedText}</p>}
//       {q.submittedFileUrl && (
//         <a href={q.submittedFileUrl} target="_blank" rel="noreferrer" className="text-sm text-accent-sky underline">
//           View uploaded answer file
//         </a>
//       )}
//       {!q.submittedText && !q.submittedFileUrl && <p className="text-sm italic text-muted">No answer submitted.</p>}

//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr_auto]">
//         <div>
//           <label className="text-xs text-muted">Score (max {q.marksAllocated})</label>
//           <input
//             type="number"
//             min={0}
//             max={q.marksAllocated}
//             value={score}
//             onChange={(e) => setScore(e.target.value)}
//             className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-paper focus:border-accent-sky focus:outline-none"
//           />
//         </div>
//         <div>
//           <label className="text-xs text-muted">Feedback (optional)</label>
//           <input
//             value={feedback}
//             onChange={(e) => setFeedback(e.target.value)}
//             placeholder="Good explanation, but missed..."
//             className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
//           />
//         </div>
//         <div className="flex items-end">
//           <Button onClick={handleSave} isLoading={isSaving} className="w-auto px-4">
//             {isGraded ? "Update" : "Save Grade"}
//           </Button>
//         </div>
//       </div>
//       {isGraded && <Badge tone="teal">Graded</Badge>}
//     </div>
//   );
// }

// export function GradingDialog({ sessionId, onClose, onGraded }: Props) {
//   const [detail, setDetail] = useState<SubmissionDetail | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isFinalizing, setIsFinalizing] = useState(false);

//   useEffect(() => {
//     if (!sessionId) return;
//     setIsLoading(true);
//     submissionService
//       .getById(sessionId)
//       .then(setDetail)
//       .catch((err) => toast.error(extractExamErrorMessage(err)))
//       .finally(() => setIsLoading(false));
//   }, [sessionId]);

//   async function handleGrade(answerId: string, score: number, feedback: string) {
//     try {
//       const updated = await submissionService.gradeAnswer(answerId, { score, feedback: feedback || undefined });
//       setDetail(updated);
//       toast.success("Grade saved");
//       onGraded();
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     }
//   }

//   async function handleFinalize() {
//     if (!sessionId) return;
//     setIsFinalizing(true);
//     try {
//       await submissionService.finalize(sessionId);
//       toast.success("Result finalized");
//       onGraded();
//       onClose();
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsFinalizing(false);
//     }
//   }

//   const pendingCount = detail?.questions.filter((q) => q.grading?.status === "PENDING").length ?? 0;

//   return (
//     <Dialog open={Boolean(sessionId)} onClose={onClose} title={detail ? `Grading — ${detail.studentName}` : "Grading"} size="lg">
//       {isLoading ? (
//         <p className="py-10 text-center text-sm text-muted">Loading submission...</p>
//       ) : detail ? (
//         <div className="space-y-5">
//           <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
//             <div>
//               <p className="text-sm text-paper">{detail.examTitle}</p>
//               <p className="text-xs text-muted">
//                 Submitted {detail.submittedAt ? new Date(detail.submittedAt).toLocaleString() : "—"}
//               </p>
//             </div>
//             <Badge tone="sky">Total so far: {detail.totalMarks}</Badge>
//           </div>

//           <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
//             {detail.questions.map((q, i) => (
//               <div key={q.questionId} className="space-y-2">
//                 <p className="text-sm font-medium text-paper">
//                   Q{i + 1}. {q.questionText}{" "}
//                   <span className="font-normal text-muted">({q.marksAllocated} marks)</span>
//                 </p>
//                 {q.isObjective ? (
//                   <ObjectiveAnswerView q={q} />
//                 ) : (
//                   <SubjectiveGradingRow q={q} onSave={handleGrade} />
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="flex items-center justify-between border-t border-border pt-4">
//             <p className="text-xs text-muted">
//               {pendingCount > 0 ? `${pendingCount} answer(s) still need grading` : "All answers graded"}
//             </p>
//             <Button
//               onClick={handleFinalize}
//               isLoading={isFinalizing}
//               disabled={pendingCount > 0}
//               className="w-auto bg-accent-teal px-5 hover:bg-accent-teal/90"
//             >
//               Finalize Result
//             </Button>
//           </div>
//         </div>
//       ) : (
//         <p className="py-10 text-center text-sm text-muted">Submission not found.</p>
//       )}
//     </Dialog>
//   );
// }







"use client";

import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { submissionService } from "@/services/submissionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import { resolveUploadUrl } from "@/lib/uploads";
import type { SubmissionDetail, SubmissionQuestionDetail } from "@/types/submission";

interface Props {
  sessionId: string | null;
  onClose: () => void;
  onGraded: () => void;
}

function ObjectiveAnswerView({ q }: { q: SubmissionQuestionDetail }) {
  return (
    <div className="space-y-1.5">
      {q.options?.map((opt) => {
        const wasSelected = q.selectedOptionIds.includes(opt.id);
        return (
          <div
            key={opt.id}
            className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm ${
              opt.isCorrect
                ? "border-accent-teal/40 bg-accent-teal/10 text-paper"
                : wasSelected
                ? "border-accent-rose/40 bg-accent-rose/10 text-paper"
                : "border-border text-muted"
            }`}
          >
            {opt.isCorrect ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-teal" />
            ) : wasSelected ? (
              <XCircle className="h-4 w-4 shrink-0 text-accent-rose" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted" />
            )}
            {opt.optionText}
            {wasSelected && <span className="ml-auto text-xs text-muted">(student&apos;s answer)</span>}
          </div>
        );
      })}
      <p className="pt-1 text-xs text-muted">
        Auto-graded: <span className="text-paper">{q.marksAwarded ?? 0}</span> / {q.marksAllocated} marks
      </p>
    </div>
  );
}

function SubjectiveGradingRow({
  q,
  onSave,
}: {
  q: SubmissionQuestionDetail;
  onSave: (answerId: string, score: number, feedback: string) => Promise<void>;
}) {
  const [score, setScore] = useState(String(q.grading?.examinerScore ?? q.marksAwarded ?? ""));
  const [feedback, setFeedback] = useState(q.grading?.feedback ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const isGraded = q.grading?.status === "GRADED";

  // No Answer row exists for this question (the student never submitted one), so
  // there is nothing an examiner can grade. Render a distinct read-only state
  // instead of the editable form below, whose Save button would otherwise
  // silently no-op on `if (!q.answerId) return`.
  if (!q.answerId) {
    return (
      <div className="space-y-2 rounded-lg border border-dashed border-border bg-surface-muted/60 p-4">
        <Badge tone="neutral">Not Attempted</Badge>
        <p className="text-sm italic text-muted">
          The student did not submit an answer for this question — there is nothing to grade.
        </p>
      </div>
    );
  }

  async function handleSave() {
    const scoreNum = Number(score);
    if (Number.isNaN(scoreNum) || scoreNum < 0) {
      toast.error("Enter a valid non-negative score");
      return;
    }
    if (scoreNum > q.marksAllocated) {
      toast.error(`Score cannot exceed ${q.marksAllocated} marks`);
      return;
    }
    if (!q.answerId) {
      // Defensive guard only — unreachable via the UI now that the early return
      // above handles this case. Kept loud (not silent) in case this row is ever
      // reused without that check.
      toast.error("This question has no submitted answer to grade.");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(q.answerId, scoreNum, feedback);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-muted p-4">
      {q.submittedText && <p className="whitespace-pre-wrap text-sm text-paper">{q.submittedText}</p>}
      {q.submittedFileUrl && (
        <a
          href={resolveUploadUrl(q.submittedFileUrl) ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-accent-sky underline"
        >
          View uploaded answer file
        </a>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr_auto]">
        <div>
          <label className="text-xs text-muted">Score (max {q.marksAllocated})</label>
          <input
            type="number"
            min={0}
            max={q.marksAllocated}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-paper focus:border-accent-sky focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-muted">Feedback (optional)</label>
          <input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Good explanation, but missed..."
            className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSave} isLoading={isSaving} className="w-auto px-4">
            {isGraded ? "Update" : "Save Grade"}
          </Button>
        </div>
      </div>
      {isGraded && <Badge tone="teal">Graded</Badge>}
    </div>
  );
}

export function GradingDialog({ sessionId, onClose, onGraded }: Props) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setIsLoading(true);
    submissionService
      .getById(sessionId)
      .then(setDetail)
      .catch((err) => toast.error(extractExamErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  async function handleGrade(answerId: string, score: number, feedback: string) {
    try {
      const updated = await submissionService.gradeAnswer(answerId, { score, feedback: feedback || undefined });
      setDetail(updated);
      toast.success("Grade saved");
      onGraded();
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    }
  }

  async function handleFinalize() {
    if (!sessionId) return;
    setIsFinalizing(true);
    try {
      await submissionService.finalize(sessionId);
      toast.success("Result finalized");
      onGraded();
      onClose();
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsFinalizing(false);
    }
  }

  const pendingCount = detail?.questions.filter((q) => q.grading?.status === "PENDING").length ?? 0;

  return (
    <Dialog open={Boolean(sessionId)} onClose={onClose} title={detail ? `Grading — ${detail.studentName}` : "Grading"} size="lg">
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted">Loading submission...</p>
      ) : detail ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <p className="text-sm text-paper">{detail.examTitle}</p>
              <p className="text-xs text-muted">
                Submitted {detail.submittedAt ? new Date(detail.submittedAt).toLocaleString() : "—"}
              </p>
            </div>
            <Badge tone="sky">Total so far: {detail.totalMarks}</Badge>
          </div>

          <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
            {detail.questions.map((q, i) => (
              <div key={q.questionId} className="space-y-2">
                <p className="text-sm font-medium text-paper">
                  Q{i + 1}. {q.questionText}{" "}
                  <span className="font-normal text-muted">({q.marksAllocated} marks)</span>
                </p>
                {q.isObjective ? (
                  <ObjectiveAnswerView q={q} />
                ) : (
                  <SubjectiveGradingRow q={q} onSave={handleGrade} />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted">
              {pendingCount > 0 ? `${pendingCount} answer(s) still need grading` : "All answers graded"}
            </p>
            <Button
              onClick={handleFinalize}
              isLoading={isFinalizing}
              disabled={pendingCount > 0}
              className="w-auto bg-accent-teal px-5 hover:bg-accent-teal/90"
            >
              Finalize Result
            </Button>
          </div>
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted">Submission not found.</p>
      )}
    </Dialog>
  );
}
