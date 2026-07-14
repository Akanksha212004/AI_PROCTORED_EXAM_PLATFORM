"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Card";
import { DIFFICULTY_LEVELS, QUESTION_TYPES } from "@/types/question";
import { questionTypeLabel } from "@/components/ui/Badge";
import type { DifficultyLevel, QuestionType } from "@/types/question";

export interface FilterState {
  search: string;
  subject: string;
  questionType: QuestionType | "";
  difficultyLevel: DifficultyLevel | "";
}

interface Props {
  value: FilterState;
  onChange: (value: FilterState) => void;
  subjectOptions: string[];
}

export function QuestionFilters({ value, onChange, subjectOptions }: Props) {
  const hasActiveFilters =
    value.search || value.subject || value.questionType || value.difficultyLevel;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute left-3.5 top-[38px] h-4 w-4 text-muted" />
        <Input
          label="Search"
          placeholder="Search by question text..."
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <div className="w-full sm:w-44">
        <Select
          label="Subject"
          value={value.subject}
          onChange={(e) => onChange({ ...value, subject: e.target.value })}
        >
          <option value="">All subjects</option>
          {subjectOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-full sm:w-44">
        <Select
          label="Question Type"
          value={value.questionType}
          onChange={(e) =>
            onChange({ ...value, questionType: e.target.value as QuestionType | "" })
          }
        >
          <option value="">All types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {questionTypeLabel(t)}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-full sm:w-40">
        <Select
          label="Difficulty"
          value={value.difficultyLevel}
          onChange={(e) =>
            onChange({ ...value, difficultyLevel: e.target.value as DifficultyLevel | "" })
          }
        >
          <option value="">All levels</option>
          {DIFFICULTY_LEVELS.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => onChange({ search: "", subject: "", questionType: "", difficultyLevel: "" })}
          className="flex h-11 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-paper"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  );
}
