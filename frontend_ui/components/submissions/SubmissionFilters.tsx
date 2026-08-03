"use client";

import { Select } from "@/components/ui/Card";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SubmissionFilters({ value, onChange }: Props) {
  const { t } = useI18n();

  return (
    <div className="w-full sm:w-56">
      <Select label={t("submissions.filters.status")} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t("submissions.filters.allSubmissions")}</option>
        <option value="PENDING_REVIEW">{t("submissions.filters.needsReview")}</option>
        <option value="FULLY_GRADED">{t("submissions.filters.fullyGraded")}</option>
        <option value="FULLY_AUTO_GRADED">{t("submissions.filters.autoGraded")}</option>
      </Select>
    </div>
  );
}
