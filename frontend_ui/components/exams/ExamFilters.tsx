"use client";

import { X } from "lucide-react";

import { Select } from "@/components/ui/Card";
import { useI18n } from "@/hooks/useI18n";

import { useAutoTranslate } from "@/hooks/useAutoTranslate";

function LocalizedText({ text }: { text: string }) {
  const translated = useAutoTranslate(text);
  return <>{translated}</>;
}

export interface ExamFilterState {
  subject: string;
}

interface Props {
  value: ExamFilterState;
  onChange: (value: ExamFilterState) => void;
  subjectOptions: string[];
}

export function ExamFilters({ value, onChange, subjectOptions }: Props) {
  const { t } = useI18n();
  const hasActiveFilters = Boolean(value.subject);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="w-full sm:w-56">
        <Select label={t("exams.filters.subject")} value={value.subject} onChange={(e) => onChange({ subject: e.target.value })}>
          <option value="">{t("exams.filters.allSubjects")}</option>
          {subjectOptions.map((s) => (
            <option key={s} value={s}>
              <LocalizedText text={s} /> {/* ◄── Sarvam AI Auto-Translate */}
            </option>
          ))}
        </Select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => onChange({ subject: "" })}
          className="flex h-11 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-paper"
        >
          <X className="h-4 w-4" />
          {t("exams.filters.clear")}
        </button>
      )}
    </div>
  );
}
