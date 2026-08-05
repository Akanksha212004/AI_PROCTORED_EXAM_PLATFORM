"use client";

import { Eye, FileBarChart, FileText, X } from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/hooks/useI18n";
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

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportsContent() {
  const { t } = useI18n();
  const {
    items,
    isLoading,
    downloadingId,
    // downloadCsv,
    downloadPdf,
    viewDetail,
    isLoadingDetail,
    viewReport,
    closeReport,
  } = useReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">{t("admin.reports.title")}</h1>
        <p className="mt-1.5 text-sm text-paper/60">
          {t("admin.reports.subtitle")}
        </p>
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
            <p className="text-sm text-muted">{t("admin.reports.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">{t("admin.reports.table.exam")}</th>
                  <th className="px-5 py-3 font-medium">{t("admin.reports.table.status")}</th>
                  <th className="px-5 py-3 font-medium">{t("admin.reports.table.attempts")}</th>
                  <th className="px-5 py-3 font-medium">{t("admin.reports.table.averageScore")}</th>
                  <th className="px-5 py-3 font-medium">{t("admin.reports.table.passRate")}</th>
                  <th className="px-5 py-3 font-medium text-right">{t("admin.reports.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((exam: ExamReportRow) => (
                  <tr key={exam.id} className="border-b border-border/60 last:border-0">
                    <td className="max-w-[220px] px-5 py-3.5">
                      <p className="truncate font-medium text-paper">{exam.title}</p>
                      <p className="truncate text-xs text-muted">{exam.subject}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_CLASS[exam.status])}>
                        {t(`admin.reports.status.${exam.status}`)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-paper/80">{exam.attempts}</td>
                    <td className="px-5 py-3.5 text-paper/80">
                      {exam.averageScore !== null ? `${exam.averageScore}%` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-paper/80">{exam.passRate !== null ? `${exam.passRate}%` : "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => viewReport(exam.id)}
                          disabled={exam.attempts === 0}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                          title={exam.attempts === 0 ? t("admin.reports.noSubmissionsYetTitle") : t("admin.reports.viewReportTitle")}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("admin.reports.view")}
                        </button>
                        <button
                          onClick={() => downloadPdf(exam.id, exam.title)}
                          disabled={downloadingId === `${exam.id}-pdf` || exam.attempts === 0}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                          title={exam.attempts === 0 ? t("admin.reports.noSubmissionsYetTitle") : t("admin.reports.downloadPdfTitle")}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {downloadingId === `${exam.id}-pdf` ? "…" : t("admin.reports.pdf")}
                        </button>
                        {/* <button
                          onClick={() => downloadCsv(exam.id, exam.title)}
                          disabled={downloadingId === `${exam.id}-csv` || exam.attempts === 0}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                          title={exam.attempts === 0 ? "No submissions yet" : "Download CSV"}
                        >
                          <Download className="h-3.5 w-3.5" />
                          {downloadingId === `${exam.id}-csv` ? "…" : "CSV"}
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(viewDetail || isLoadingDetail) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeReport}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoadingDetail || !viewDetail ? (
              <div className="space-y-3">
                <div className="h-6 w-48 animate-pulse rounded bg-surface-muted" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-surface-muted" />
                ))}
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold text-paper">{viewDetail.exam.title}</p>
                    <p className="truncate text-xs text-muted">{viewDetail.exam.subject}</p>
                  </div>
                  <button
                    onClick={closeReport}
                    className="shrink-0 text-paper/60 transition-colors hover:text-paper"
                    aria-label={t("admin.reports.close")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-5 flex flex-wrap gap-4 text-sm">
                  <span className="text-paper/70">
                    <span className="text-paper">{viewDetail.summary.attempts}</span> {t("admin.reports.attempts")}
                  </span>
                  <span className="text-paper/70">
                    {t("admin.reports.avg")} <span className="text-paper">{viewDetail.summary.averageScore ?? "—"}%</span>
                  </span>
                  <span className="text-paper/70">
                    {t("admin.reports.passRateLabel")} <span className="text-paper">{viewDetail.summary.passRate ?? "—"}%</span>
                  </span>
                </div>

                {viewDetail.rows.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">{t("admin.reports.detail.empty")}</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                          <th className="px-4 py-2.5 font-medium">{t("admin.reports.detail.student")}</th>
                          <th className="px-4 py-2.5 font-medium">{t("admin.reports.detail.status")}</th>
                          <th className="px-4 py-2.5 font-medium">{t("admin.reports.detail.score")}</th>
                          <th className="px-4 py-2.5 font-medium">{t("admin.reports.detail.submitted")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewDetail.rows.map((row, i) => (
                          <tr key={i} className="border-b border-border/60 last:border-0">
                            <td className="max-w-[200px] px-4 py-2.5">
                              <p className="truncate text-paper">{row.studentName}</p>
                              <p className="truncate text-xs text-muted">{row.studentEmail}</p>
                            </td>
                            <td className="px-4 py-2.5 text-paper/80">{row.status}</td>
                            <td className="px-4 py-2.5 text-paper/80">
                              {row.maxMarks !== null ? `${row.marksObtained ?? "—"}/${row.maxMarks}` : "—"}
                              {row.percentage !== null ? ` (${row.percentage}%)` : ""}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-xs text-muted">
                              {formatDateTime(row.submittedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
