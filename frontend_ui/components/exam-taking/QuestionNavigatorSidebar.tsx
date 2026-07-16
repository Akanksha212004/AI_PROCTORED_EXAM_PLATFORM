// import { cn } from "@/lib/utils";
// import type { SessionQuestionView } from "@/types/examSession";

// interface Props {
//   questions: SessionQuestionView[];
//   activeIndex: number;
//   onSelect: (index: number) => void;
// }

// function isAnswered(q: SessionQuestionView): boolean {
//   if (!q.answer) return false;
//   if (q.answer.selectedOptionIds.length > 0) return true;
//   if (q.answer.submittedText && q.answer.submittedText.trim().length > 0) return true;
//   if (q.answer.submittedFileUrl) return true;
//   return false;
// }

// export function QuestionNavigatorSidebar({ questions, activeIndex, onSelect }: Props) {
//   const answeredCount = questions.filter(isAnswered).length;

//   return (
//     <div className="flex h-full flex-col gap-4">
//       <div>
//         <p className="text-xs uppercase tracking-wide text-muted">Progress</p>
//         <p className="mt-1 text-sm text-paper">
//           {answeredCount} / {questions.length} answered
//         </p>
//       </div>

//       <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
//         {questions.map((q, i) => {
//           const answered = isAnswered(q);
//           const active = i === activeIndex;
//           return (
//             <button
//               key={q.questionId}
//               onClick={() => onSelect(i)}
//               className={cn(
//                 "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
//                 active
//                   ? "border-accent-sky bg-accent-sky text-surface-muted"
//                   : answered
//                   ? "border-accent-teal/40 bg-accent-teal/10 text-accent-teal"
//                   : "border-border text-muted hover:bg-white/5"
//               )}
//             >
//               {i + 1}
//             </button>
//           );
//         })}
//       </div>

//       <div className="mt-auto space-y-1.5 text-xs text-muted">
//         <div className="flex items-center gap-2">
//           <span className="h-3 w-3 rounded border border-accent-teal/40 bg-accent-teal/10" /> Answered
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="h-3 w-3 rounded border border-border" /> Not answered
//         </div>
//       </div>
//     </div>
//   );
// }



import { cn } from "@/lib/utils";
import type { SessionQuestionView } from "@/types/examSession";

interface Props {
  questions: SessionQuestionView[];
  activeIndex: number;
  visitedQuestionIds: Set<string>;
  onSelect: (index: number) => void;
}

function isAnswered(q: SessionQuestionView): boolean {
  if (!q.answer) return false;
  if (q.answer.selectedOptionIds.length > 0) return true;
  if (q.answer.submittedText && q.answer.submittedText.trim().length > 0) return true;
  if (q.answer.submittedFileUrl) return true;
  return false;
}

type PaletteState = "unvisited" | "answered" | "notAnswered" | "markedAnswered" | "markedNotAnswered";

function getState(q: SessionQuestionView, visited: boolean): PaletteState {
  const answered = isAnswered(q);
  const marked = q.answer?.markedForReview ?? false;

  if (marked) return answered ? "markedAnswered" : "markedNotAnswered";
  if (!visited) return "unvisited";
  return answered ? "answered" : "notAnswered";
}

const STATE_STYLES: Record<PaletteState, string> = {
  unvisited: "border-border text-muted hover:bg-white/5",
  answered: "border-accent-teal bg-accent-teal/15 text-accent-teal",
  notAnswered: "border-accent-rose bg-accent-rose/15 text-accent-rose",
  markedAnswered: "border-violet-400 bg-violet-400/15 text-violet-300",
  markedNotAnswered: "border-amber-500 bg-amber-500/15 text-amber-400",
};

const LEGEND: { state: PaletteState; label: string; swatch: string }[] = [
  { state: "unvisited", label: "Not Visited", swatch: "border-border" },
  { state: "answered", label: "Answered", swatch: "border-accent-teal bg-accent-teal/15" },
  { state: "notAnswered", label: "Not Answered", swatch: "border-accent-rose bg-accent-rose/15" },
  { state: "markedAnswered", label: "Marked for Review (Answered)", swatch: "border-violet-400 bg-violet-400/15" },
  { state: "markedNotAnswered", label: "Marked for Review", swatch: "border-amber-500 bg-amber-500/15" },
];

export function QuestionNavigatorSidebar({ questions, activeIndex, visitedQuestionIds, onSelect }: Props) {
  const counts = questions.reduce(
    (acc, q) => {
      const state = getState(q, visitedQuestionIds.has(q.questionId));
      acc[state] += 1;
      return acc;
    },
    { unvisited: 0, answered: 0, notAnswered: 0, markedAnswered: 0, markedNotAnswered: 0 } as Record<PaletteState, number>
  );
  const markedTotal = counts.markedAnswered + counts.markedNotAnswered;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 text-xs text-muted">
        <div>
          Answered: <span className="text-accent-teal">{counts.answered}</span>
        </div>
        <div>
          Not answered: <span className="text-accent-rose">{counts.notAnswered}</span>
        </div>
        <div>
          Marked: <span className="text-violet-300">{markedTotal}</span>
        </div>
        <div>
          Not visited: <span className="text-muted">{counts.unvisited}</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
        {questions.map((q, i) => {
          const state = getState(q, visitedQuestionIds.has(q.questionId));
          const active = i === activeIndex;
          return (
            <button
              key={q.questionId}
              onClick={() => onSelect(i)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                STATE_STYLES[state],
                active && "ring-2 ring-accent-sky ring-offset-2 ring-offset-surface"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-auto space-y-1.5 text-xs text-muted">
        {LEGEND.map((item) => (
          <div key={item.state} className="flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded border", item.swatch)} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}