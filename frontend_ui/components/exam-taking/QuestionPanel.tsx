"use client";

import { ImageIcon, Upload } from "lucide-react";
import { useRef } from "react";

import { Badge, difficultyTone, questionTypeLabel } from "@/components/ui/Badge";
import { STATIC_FILE_ORIGIN } from "@/lib/axios";
import type { SessionQuestionView } from "@/types/examSession";

interface Props {
  question: SessionQuestionView;
  index: number;
  total: number;
  onSelectOptions: (optionIds: string[]) => void;
  onTextChange: (text: string) => void;
  onFileUpload: (file: File) => void;
}

export function QuestionPanel({ question, index, total, onSelectOptions, onTextChange, onFileUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedIds = new Set(question.answer?.selectedOptionIds ?? []);

  function toggleMcq(optionId: string) {
    onSelectOptions([optionId]);
  }

  function toggleMultiSelect(optionId: string) {
    const next = new Set(selectedIds);
    if (next.has(optionId)) next.delete(optionId);
    else next.add(optionId);
    onSelectOptions([...next]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">
          Question {index + 1} of {total}
        </Badge>
        <Badge tone="sky">{questionTypeLabel(question.questionType)}</Badge>
        <Badge tone={difficultyTone(question.difficultyLevel)}>{question.difficultyLevel}</Badge>
        <Badge tone="neutral">{question.marksAllocated} marks</Badge>
      </div>

      <p className="whitespace-pre-wrap text-lg text-paper">{question.questionText}</p>

      {question.questionType === "MCQ" && (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                selectedIds.has(opt.id)
                  ? "border-accent-sky bg-accent-sky/10 text-paper"
                  : "border-border text-paper/80 hover:bg-white/5"
              }`}
            >
              <input
                type="radio"
                name={question.questionId}
                checked={selectedIds.has(opt.id)}
                onChange={() => toggleMcq(opt.id)}
                className="h-4 w-4 accent-accent-sky"
              />
              {opt.optionText}
            </label>
          ))}
        </div>
      )}

      {question.questionType === "MULTI_SELECT" && (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                selectedIds.has(opt.id)
                  ? "border-accent-sky bg-accent-sky/10 text-paper"
                  : "border-border text-paper/80 hover:bg-white/5"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(opt.id)}
                onChange={() => toggleMultiSelect(opt.id)}
                className="h-4 w-4 rounded accent-accent-sky"
              />
              {opt.optionText}
            </label>
          ))}
        </div>
      )}

      {(question.questionType === "SHORT_ANSWER" || question.questionType === "LONG_ANSWER") && (
        <textarea
          value={question.answer?.submittedText ?? ""}
          onChange={(e) => onTextChange(e.target.value)}
          rows={question.questionType === "LONG_ANSWER" ? 10 : 4}
          placeholder="Type your answer here..."
          className="w-full rounded-lg border border-border bg-surface-muted p-4 text-sm text-paper placeholder:text-muted focus:border-accent-sky focus:outline-none"
        />
      )}

      {question.questionType === "IMAGE_UPLOAD" && (
        <div>
          {question.answer?.submittedFileUrl ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-4 py-3">
              <a
                href={`${STATIC_FILE_ORIGIN}${question.answer.submittedFileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-accent-sky underline"
              >
                <ImageIcon className="h-4 w-4" /> View uploaded answer
              </a>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-muted hover:text-paper"
              >
                Replace
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border border-dashed border-border p-8 text-center transition-colors hover:border-accent-sky/50"
            >
              <Upload className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-2 text-sm text-paper">Click to upload your handwritten answer</p>
              <p className="mt-1 text-xs text-muted">PNG, JPEG, WEBP, or PDF — up to 10MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(file);
            }}
          />
        </div>
      )}
    </div>
  );
}
