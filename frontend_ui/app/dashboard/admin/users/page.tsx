"use client";

// app/dashboard/admin/users/page.tsx

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminDashboardSummary } from "@/hooks/useAdminDashboardSummary";
import { UserStatsCards } from "@/components/admin/UserStatsCards";
import { UserFilters, type UserFilterState } from "@/components/admin/UserFilters";
import { UserTable } from "@/components/admin/UserTable";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { ToggleUserStatusDialog } from "@/components/admin/ToggleUserStatusDialog";
import { ChangeUserRoleDialog } from "@/components/admin/ChangeUserRoleDialog";
import type { PlatformUser } from "@/types/admin";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRole="ADMIN">
      <DashboardShell>
        <AdminUsersContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function AdminUsersContent() {
  const { user: currentUser } = useAuth();
  const { summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useAdminDashboardSummary();

  const [filters, setFilters] = useState<UserFilterState>({ search: "", role: "", status: "" });
  const [page, setPage] = useState(1);

  const listParams = useMemo(
    () => ({
      search: filters.search.trim() || undefined,
      role: filters.role || undefined,
      status: filters.status || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [filters, page]
  );

  const { items, pagination, isLoading, refetch } = useAdminUsers(listParams);

  const [overrides, setOverrides] = useState<Record<string, Partial<PlatformUser>>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<PlatformUser | null>(null);
  const [roleTarget, setRoleTarget] = useState<PlatformUser | null>(null);

  const resolvedItems = items.map((u) => ({ ...u, ...overrides[u.id] }));

  function handleFilterChange(next: UserFilterState) {
    setFilters(next);
    setPage(1);
  }

  function handleCreated() {
    refetch();
    refetchSummary();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper">User Management</h1>
          <p className="text-sm text-muted">Every account on the platform — students, examiners, and admins.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="w-auto px-4">
          <Plus className="h-4 w-4" />
          Create Account
        </Button>
      </div>

      <UserStatsCards summary={summary} isLoading={isSummaryLoading} />

      <Card className="p-5">
        <UserFilters value={filters} onChange={handleFilterChange} />
      </Card>

      <Card className="overflow-hidden p-0">
        <UserTable
          users={resolvedItems}
          isLoading={isLoading}
          currentUserId={currentUser?.id}
          onToggleStatus={setStatusTarget}
          onChangeRole={setRoleTarget}
        />
        <Pagination pagination={pagination} onPageChange={setPage} itemLabel="accounts" />
      </Card>

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />

      <ToggleUserStatusDialog
        user={statusTarget}
        onClose={() => setStatusTarget(null)}
        onUpdated={(userId, isActive) => {
          setOverrides((prev) => ({ ...prev, [userId]: { ...prev[userId], isActive } }));
          refetchSummary();
        }}
      />

      <ChangeUserRoleDialog
        user={roleTarget}
        onClose={() => setRoleTarget(null)}
        onUpdated={(userId, role) => {
          setOverrides((prev) => ({ ...prev, [userId]: { ...prev[userId], role } }));
          refetchSummary();
        }}
      />
    </div>
  );
}
