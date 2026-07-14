"use client";

import { Select } from "@/components/ui/Card";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SubmissionFilters({ value, onChange }: Props) {
  return (
    <div className="w-full sm:w-56">
      <Select label="Status" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All submissions</option>
        <option value="PENDING_REVIEW">Needs Review</option>
        <option value="FULLY_GRADED">Fully Graded</option>
        <option value="FULLY_AUTO_GRADED">Auto-Graded (MCQ only)</option>
      </Select>
    </div>
  );
}
