"use client";

import { Eye, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { SubmissionListItem } from "@/types/submission";

interface Props {
  submissions: SubmissionListItem[];
  isLoading: boolean;
  onReview: (s: SubmissionListItem) => void;
}

function statusTone(status: string): "sky" | "amber" | "teal" {
  if (status === "FULLY_GRADED") return "teal";
  if (status === "PENDING_REVIEW") return "amber";
  return "sky"; // FULLY_AUTO_GRADED
}

function statusLabel(status: string): string {
  if (status === "FULLY_GRADED") return "Graded";
  if (status === "PENDING_REVIEW") return "Needs Review";
  return "Auto-Graded";
}

export function SubmissionsTable({ submissions, isLoading, onReview }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading submissions...
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="font-display text-lg text-paper">No submissions yet</p>
        <p className="max-w-sm text-sm text-muted">
          Once students submit exams you created, they&apos;ll show up here for grading.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="py-3 pr-4 font-medium">Student</th>
            <th className="py-3 pr-4 font-medium">Exam</th>
            <th className="py-3 pr-4 font-medium">Submitted</th>
            <th className="py-3 pr-4 font-medium">Auto-Score</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-b border-border/60 hover:bg-white/[0.03]">
              <td className="py-3.5 pr-4">
                <p className="text-paper">{s.studentName}</p>
                <p className="text-xs text-muted">{s.studentEmail}</p>
              </td>
              <td className="py-3.5 pr-4">
                <p className="text-paper">{s.examTitle}</p>
                <p className="text-xs text-muted">{s.examSubject}</p>
              </td>
              <td className="py-3.5 pr-4 text-muted">
                {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
              </td>
              <td className="py-3.5 pr-4 text-paper">{s.autoGradedMarks}</td>
              <td className="py-3.5 pr-4">
                <Badge tone={statusTone(s.gradingStatus)}>
                  {statusLabel(s.gradingStatus)}
                  {s.gradingStatus === "PENDING_REVIEW" ? ` (${s.pendingCount})` : ""}
                </Badge>
              </td>
              <td className="py-3.5 pr-2 text-right">
                <button
                  onClick={() => onReview(s)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-accent-sky hover:bg-white/5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {s.gradingStatus === "PENDING_REVIEW" ? "Grade" : "View"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
