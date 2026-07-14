"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { Dialog } from "@/components/ui/Dialog";
import { Badge, difficultyTone, questionTypeLabel } from "@/components/ui/Badge";
import type { Question } from "@/types/question";

import { getFileUrl } from "@/lib/utils";

interface Props {
  question: Question | null;
  onClose: () => void;
}

function resolveBackendOrigin() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!base) return "http://localhost:8000";

  try {
    return new URL(base).origin;
  } catch {
    return "http://localhost:8000";
  }
}

export function QuestionViewModal({ question, onClose }: Props) {
  if (!question) return null;
  const showOptions = question.questionType === "MCQ" || question.questionType === "MULTI_SELECT";
  const showModelAnswer = question.questionType === "SHORT_ANSWER" || question.questionType === "LONG_ANSWER";

  return (
    <Dialog open={Boolean(question)} onClose={onClose} title="Question Details" size="md">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone="sky">{questionTypeLabel(question.questionType)}</Badge>
          <Badge tone={difficultyTone(question.difficultyLevel)}>
            {question.difficultyLevel.charAt(0) + question.difficultyLevel.slice(1).toLowerCase()}
          </Badge>
          <Badge tone="neutral">{question.subject}</Badge>
          <Badge tone="neutral">{question.marks} marks</Badge>
          {question.negativeMarks > 0 && (
            <Badge tone="rose">-{question.negativeMarks} negative</Badge>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Question</p>
          <p className="mt-1.5 whitespace-pre-wrap text-paper">{question.questionText}</p>
        </div>

        {showOptions && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Options</p>
            <ul className="mt-2 space-y-2">
              {question.options.map((opt, i) => (
                <li
                  key={opt.id ?? i}
                  className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm ${
                    opt.isCorrect
                      ? "border-accent-teal/40 bg-accent-teal/10 text-paper"
                      : "border-border text-muted"
                  }`}
                >
                  {opt.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-teal" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted" />
                  )}
                  {opt.optionText}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showModelAnswer && question.modelAnswerText && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Model Answer</p>
            <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-border bg-surface-muted p-3.5 text-sm text-paper">
              {question.modelAnswerText}
            </p>
          </div>
        )}

        {question.questionType === "IMAGE_UPLOAD" && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Reference Solution</p>
            {question.modelAnswerFileUrl ? (
              <a
                href={getFileUrl(question.modelAnswerFileUrl) ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-block text-sm text-accent-sky underline"
              >
                View uploaded file
              </a>
            ) : (
              <p className="mt-1.5 text-sm text-muted">No reference file uploaded yet.</p>
            )}
          </div>
        )}

        <div className="flex justify-between border-t border-border pt-4 text-xs text-muted">
          <span>Created {new Date(question.createdAt).toLocaleString()}</span>
          <span>Updated {new Date(question.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </Dialog>
  );
}
