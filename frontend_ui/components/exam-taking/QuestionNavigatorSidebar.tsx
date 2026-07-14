import { cn } from "@/lib/utils";
import type { SessionQuestionView } from "@/types/examSession";

interface Props {
  questions: SessionQuestionView[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function isAnswered(q: SessionQuestionView): boolean {
  if (!q.answer) return false;
  if (q.answer.selectedOptionIds.length > 0) return true;
  if (q.answer.submittedText && q.answer.submittedText.trim().length > 0) return true;
  if (q.answer.submittedFileUrl) return true;
  return false;
}

export function QuestionNavigatorSidebar({ questions, activeIndex, onSelect }: Props) {
  const answeredCount = questions.filter(isAnswered).length;

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Progress</p>
        <p className="mt-1 text-sm text-paper">
          {answeredCount} / {questions.length} answered
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
        {questions.map((q, i) => {
          const answered = isAnswered(q);
          const active = i === activeIndex;
          return (
            <button
              key={q.questionId}
              onClick={() => onSelect(i)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                active
                  ? "border-accent-sky bg-accent-sky text-surface-muted"
                  : answered
                  ? "border-accent-teal/40 bg-accent-teal/10 text-accent-teal"
                  : "border-border text-muted hover:bg-white/5"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-auto space-y-1.5 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-accent-teal/40 bg-accent-teal/10" /> Answered
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-border" /> Not answered
        </div>
      </div>
    </div>
  );
}
