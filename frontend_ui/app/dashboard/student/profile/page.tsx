"use client";

import Link from "next/link";
import {
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Mail,
  Settings as SettingsIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { cn } from "@/lib/utils";

export default function StudentProfilePage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <DashboardShell>
        <ProfileContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
  return initials.toUpperCase();
}

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ProfileContent() {
  const { user } = useAuth();
  const { performance, subjectPerformance, isLoadingSubmissions } = useStudentDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">Profile</h1>
        <p className="mt-1.5 text-sm text-paper/60">A quick look at your account and exam performance.</p>
      </div>

      {/* Header banner */}
      <Card className="relative overflow-hidden p-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-accent-sky/15 via-accent-teal/10 to-transparent" />

        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-sky/40 to-accent-teal/20 font-display text-2xl font-semibold text-accent-sky ring-4 ring-surface">
            {getInitials(user?.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-display text-xl font-semibold text-paper">{user?.name ?? "—"}</p>
              <span className="rounded-full bg-accent-teal/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent-teal">
                Student
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-paper/60">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user?.email ?? "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Member since {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>

          <Link href="/dashboard/student/settings" className="sm:shrink-0">
            <Button variant="secondary" className="w-full sm:w-auto sm:px-5">
              <SettingsIcon className="h-4 w-4" />
              Edit profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Performance stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          icon={<CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />}
          label="Exams Taken"
          value={performance.completedCount}
          accent="teal"
          isLoading={isLoadingSubmissions}
        />
        <StatTile
          icon={<BarChart3 className="h-5 w-5" strokeWidth={1.75} />}
          label="Average Score"
          value={performance.averageScore !== null ? `${performance.averageScore}%` : "—"}
          accent="sky"
          isLoading={isLoadingSubmissions}
        />
        <StatTile
          icon={<TrendingUp className="h-5 w-5" strokeWidth={1.75} />}
          label="Best Score"
          value={performance.bestScore !== null ? `${performance.bestScore}%` : "—"}
          accent="violet"
          isLoading={isLoadingSubmissions}
        />
        <StatTile
          icon={<TrendingDown className="h-5 w-5" strokeWidth={1.75} />}
          label="Lowest Score"
          value={performance.lowestScore !== null ? `${performance.lowestScore}%` : "—"}
          accent="rose"
          isLoading={isLoadingSubmissions}
        />
      </div>

      {/* Subject performance */}
      <Card>
        <p className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-paper">
          <Award className="h-4 w-4 text-accent-amber" />
          Subject Performance
        </p>

        {isLoadingSubmissions ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 animate-pulse rounded bg-surface-muted" />
            ))}
          </div>
        ) : subjectPerformance.length === 0 ? (
          <p className="text-sm text-paper/50">No graded exams yet — your subject breakdown will appear here.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {subjectPerformance.map((s) => (
              <div key={s.subject}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-paper/80">{s.subject}</span>
                  <span className="font-medium text-paper">{s.averageScore ?? "—"}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      (s.averageScore ?? 0) >= 75
                        ? "bg-accent-teal"
                        : (s.averageScore ?? 0) >= 50
                          ? "bg-accent-amber"
                          : "bg-accent-rose"
                    )}
                    style={{ width: `${Math.min(s.averageScore ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

const accentIconClasses: Record<"teal" | "sky" | "rose" | "violet" | "amber", string> = {
  teal: "bg-gradient-to-br from-accent-teal/25 to-accent-teal/5 text-accent-teal",
  sky: "bg-gradient-to-br from-accent-sky/25 to-accent-sky/5 text-accent-sky",
  rose: "bg-gradient-to-br from-accent-rose/25 to-accent-rose/5 text-accent-rose",
  violet: "bg-gradient-to-br from-accent-violet/25 to-accent-violet/5 text-accent-violet",
  amber: "bg-gradient-to-br from-accent-amber/25 to-accent-amber/5 text-accent-amber",
};

function StatTile({
  icon,
  label,
  value,
  accent,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent: "teal" | "sky" | "rose" | "violet" | "amber";
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-[104px] animate-pulse rounded-2xl border border-border bg-surface-muted" />;
  }

  return (
    <Card className="flex flex-col items-start gap-2 p-4">
      <div className={cn("rounded-xl p-2", accentIconClasses[accent])}>{icon}</div>
      <p className="font-display text-xl font-semibold text-paper">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}
