"use client";

// app/dashboard/examiner/submissions/page.tsx

import { useMemo, useState } from "react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { useSubmissions } from "@/hooks/useSubmissions";
import { SubmissionStatsCards } from "@/components/submissions/SubmissionStatsCards";
import { SubmissionFilters } from "@/components/submissions/SubmissionFilters";
import { SubmissionsTable } from "@/components/submissions/SubmissionsTable";
import { GradingDialog } from "@/components/submissions/GradingDialog";
import type { SubmissionListItem } from "@/types/submission";

const PAGE_SIZE = 10;

export default function SubmissionsPage() {
  return (
    <RoleGuard allowedRole="EXAMINER">
      <DashboardShell>
        <SubmissionsContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function SubmissionsContent() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reviewingSessionId, setReviewingSessionId] = useState<string | null>(null);

  const filters = useMemo(() => ({ status: status || undefined, page, limit: PAGE_SIZE }), [status, page]);
  const { items, pagination, isLoading, stats, refetch } = useSubmissions(filters);

  function handleReview(s: SubmissionListItem) {
    setReviewingSessionId(s.id);
  }

  function handleGraded() {
    refetch();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper">Submissions to Review</h1>
        <p className="text-sm text-muted">Review auto-graded scores and grade subjective answers.</p>
      </div>

      <SubmissionStatsCards
        totalSubmissions={stats.totalSubmissions}
        pendingCount={stats.pendingCount}
        gradedCount={stats.gradedCount}
        isLoading={isLoading}
      />

      <Card className="p-5">
        <SubmissionFilters
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
      </Card>

      <Card className="p-5">
        <SubmissionsTable submissions={items} isLoading={isLoading} onReview={handleReview} />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>

      <GradingDialog
        sessionId={reviewingSessionId}
        onClose={() => setReviewingSessionId(null)}
        onGraded={handleGraded}
      />
    </div>
  );
}
