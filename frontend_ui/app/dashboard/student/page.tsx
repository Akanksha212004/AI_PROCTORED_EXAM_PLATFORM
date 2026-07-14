"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

import Link from "next/link";
import { FileText } from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <DashboardShell>
        <StudentDashboardContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function StudentDashboardContent() {
  const { user } = useAuth();

  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-teal">
        Student Dashboard
      </p>
      <h1 className="font-display text-3xl font-semibold text-paper">Welcome, {user?.name}</h1>
      <p className="mt-2 text-sm text-paper/60">
        Your upcoming exams and results will appear here once the Exam Engine module ships.
      </p>

      <Card className="mt-8">
        <p className="text-sm text-paper/70">
          No exams scheduled yet. Check back after your examiner publishes an exam.
        </p>
      </Card>
    </div>
  );
}
