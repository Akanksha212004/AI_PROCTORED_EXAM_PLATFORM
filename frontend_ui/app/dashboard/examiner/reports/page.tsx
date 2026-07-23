"use client";

import { Download, FileBarChart } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { useReports, type ExamReportRow, type ExamReportStatus } from "@/hooks/useReports";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  return (
    <RoleGuard allowedRole="EXAMINER">
      <DashboardShell>
        <ReportsContent />
      </DashboardShell>
    </RoleGuard>
  );
}

const STATUS_CLASS: Record<ExamReportStatus, string> = {
  DRAFT: "bg-paper/5 text-paper/40",
  PUBLISHED: "bg-accent-teal/10 text-accent-teal",
  CLOSED: "bg-accent-amber/10 text-accent-amber",
  ARCHIVED: "bg-paper/5 text-paper/40",
};

function ReportsContent() {
  const { items, isLoading, downloadingId, downloadReport } = useReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">Reports</h1>
        <p className="mt-1.5 text-sm text-paper/60">Download a full submission report (CSV) for any of your exams.</p>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-paper/30">
              <FileBarChart className="h-6 w-6" />
            </span>
            <p className="text-sm text-muted">You haven&apos;t created any exams yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Exam</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Attempts</th>
                  <th className="px-5 py-3 font-medium">Average Score</th>
                  <th className="px-5 py-3 font-medium">Pass Rate</th>
                  <th className="px-5 py-3 font-medium text-right">Export</th>
                </tr>
              </thead>
              <tbody>
                {items.map((exam: ExamReportRow) => (
                  <tr key={exam.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-paper">{exam.title}</p>
                      <p className="text-xs text-muted">{exam.subject}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_CLASS[exam.status])}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-paper/80">{exam.attempts}</td>
                    <td className="px-5 py-3.5 text-paper/80">
                      {exam.averageScore !== null ? `${exam.averageScore}%` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-paper/80">{exam.passRate !== null ? `${exam.passRate}%` : "—"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => downloadReport(exam.id, exam.title)}
                        disabled={downloadingId === exam.id || exam.attempts === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                        title={exam.attempts === 0 ? "No submissions to export yet" : "Download CSV"}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {downloadingId === exam.id ? "Preparing…" : "CSV"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
