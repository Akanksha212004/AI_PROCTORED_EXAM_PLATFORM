
"use client";

// app/dashboard/examiner/exams/page.tsx
//
// Matches questions/page.tsx exactly, now using the confirmed
// RoleGuard + DashboardShell (their real API was shared via the
// examiner dashboard page.tsx, so no more self-rolled auth gate).

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useExams } from "@/hooks/useExams";
import { useExamStats } from "@/hooks/useExamStats";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { ExamStatsCards } from "@/components/exams/ExamStatsCards";
import { ExamFilters, type ExamFilterState } from "@/components/exams/ExamFilters";
import { ExamTable } from "@/components/exams/ExamTable";
import { ExamFormDialog } from "@/components/exams/ExamFormDialog";
import { ExamViewModal } from "@/components/exams/ExamViewModal";
import { DeleteExamDialog } from "@/components/exams/DeleteExamDialog";
import type { Exam } from "@/types/exam";

const PAGE_SIZE = 10;

export default function ExamConfigurationPage() {
  return (
    <RoleGuard allowedRole="EXAMINER">
      <DashboardShell>
        <ExamConfigurationContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function ExamConfigurationContent() {
  const [filters, setFilters] = useState<ExamFilterState>({ subject: "" });
  const [page, setPage] = useState(1);

  const listFilters = useMemo(
    () => ({ subject: filters.subject || undefined, page, limit: PAGE_SIZE }),
    [filters, page]
  );

  const { items, pagination, isLoading, refetch } = useExams(listFilters);
  const { stats, isLoading: isStatsLoading, refetchStats } = useExamStats();

  const [formState, setFormState] = useState<{ open: boolean; mode: "create" | "edit"; exam: Exam | null }>({
    open: false,
    mode: "create",
    exam: null,
  });
  const [viewingExam, setViewingExam] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);

  function handleFilterChange(next: ExamFilterState) {
    setFilters(next);
    setPage(1);
  }

  function handleSaved() {
    refetch();
    refetchStats();
  }

  function handleDeleted() {
    refetch();
    refetchStats();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper">Exam Configuration</h1>
          <p className="text-sm text-muted">Create exams, set proctoring rules, and build question selection.</p>
        </div>
        <Button onClick={() => setFormState({ open: true, mode: "create", exam: null })} className="w-auto px-4">
          <Plus className="h-4 w-4" />
          New Exam
        </Button>
      </div>

      <ExamStatsCards stats={stats} isLoading={isStatsLoading} />

      <Card className="p-5">
        <ExamFilters value={filters} onChange={handleFilterChange} subjectOptions={stats?.subjects ?? []} />
      </Card>

      <Card className="p-5">
        <ExamTable
          exams={items}
          isLoading={isLoading}
          pagination={pagination}
          onView={setViewingExam}
          onEdit={(exam) => setFormState({ open: true, mode: "edit", exam })}
          onDelete={setDeletingExam}
        />
        <Pagination pagination={pagination} onPageChange={setPage} itemLabel="exams" />
      </Card>

      <ExamFormDialog
        open={formState.open}
        mode={formState.mode}
        initialExam={formState.exam}
        onClose={() => setFormState((s) => ({ ...s, open: false }))}
        onSaved={handleSaved}
      />

      <ExamViewModal exam={viewingExam} onClose={() => setViewingExam(null)} />

      <DeleteExamDialog exam={deletingExam} onClose={() => setDeletingExam(null)} onDeleted={handleDeleted} />
    </div>
  );
}
