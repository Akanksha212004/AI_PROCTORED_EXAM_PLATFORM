"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRole="ADMIN">
      <DashboardShell>
        <AdminDashboardContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();

  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-rose">
        Admin Dashboard
      </p>
      <h1 className="font-display text-3xl font-semibold text-paper">Welcome, {user?.name}</h1>
      <p className="mt-2 text-sm text-paper/60">
        Platform-wide controls for users, exams, and proctoring policy will live here.
      </p>

      <Card className="mt-8">
        <p className="text-sm text-paper/70">
          No administrative modules are wired up yet — this account is ready for them.
        </p>
      </Card>
    </div>
  );
}
