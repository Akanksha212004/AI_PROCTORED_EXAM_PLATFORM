"use client";

// app/dashboard/student/page.tsx

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  Info,
  PlayCircle,
  Sparkles,
} from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyStateCard } from "@/components/dashboard/EmptyStateCard";
import { UpcomingExamsCard } from "@/components/dashboard/UpcomingExamsCard";
import { PerformanceOverviewCard } from "@/components/dashboard/PerformanceOverviewCard";
import { StudentSubjectPerformanceCard } from "@/components/dashboard/StudentSubjectPerformanceCard";
import { ExamHistoryTable } from "@/components/dashboard/ExamHistoryTable";
import { SystemReadinessCard } from "@/components/dashboard/SystemReadinessCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { useAuth } from "@/hooks/useAuth";
import {
  useStudentDashboard,
  type StudentExamCardData,
} from "@/hooks/useStudentDashboard";
import { examSessionService } from "@/services/examSessionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import { cn } from "@/lib/utils";

import type { MySubmissionListItem } from "@/types/examSession";

export default function StudentDashboardPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <DashboardShell>
        <StudentDashboardContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StudentDashboardContent() {
  const { user } = useAuth();
  const {
    isLoading,
    isLoadingSubmissions,
    todaysExams,
    upcomingExams,
    stats,
    performance,
    subjectPerformance,
    recentActivity,
    examHistory,
    recentResults,
  } = useStudentDashboard();

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const greeting = getGreeting(new Date());

  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-teal">
            <Sparkles className="h-3.5 w-3.5" />
            Student Dashboard
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
            {greeting}, {firstName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1.5 text-sm text-paper/60">
            {stats.liveCount > 0
              ? `${stats.liveCount} exam${stats.liveCount === 1 ? "" : "s"} live right now.`
              : stats.todayCount > 0
                ? `${stats.todayCount} exam${stats.todayCount === 1 ? "" : "s"} scheduled today.`
                : "Nothing on your plate right now — you're all caught up."}
          </p>
        </div>

        <Link href="/dashboard/student/exams">
          <Button className="w-auto px-4 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0">
            <BookOpen className="h-4 w-4" />
            Browse all exams
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <StudentStatsCards stats={stats} performance={performance} isLoading={isLoading || isLoadingSubmissions} />

      {/* Today's Exams + Performance Overview */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card interactive className="flex flex-col p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-paper">Today&apos;s Exams</h2>
            <Link
              href="/dashboard/student/exams"
              className="text-xs font-medium text-accent-sky transition-colors hover:text-accent-sky/80"
            >
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl border border-border bg-surface-muted" />
              ))}
            </div>
          ) : todaysExams.length === 0 ? (
            <EmptyStateCard
              icon={CalendarClock}
              title="No exams today"
              description="You're all clear for today. Anything your examiner schedules will show up here automatically — no need to refresh."
              footnote="All clear"
              accent="teal"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {todaysExams.slice(0, 4).map((exam) => (
                <ExamHeroCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </Card>

        <PerformanceOverviewCard performance={performance} isLoading={isLoadingSubmissions} />
      </section>

      {/* Subject Performance (full width so a long subject list never forces the row above to mismatch) */}
      <StudentSubjectPerformanceCard data={subjectPerformance} isLoading={isLoadingSubmissions} />

      {/* Recent Results + Upcoming Schedule */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RecentResultsCard results={recentResults} isLoading={isLoadingSubmissions} />
        <UpcomingExamsCard
          exams={upcomingExams.slice(0, 5)}
          isLoading={isLoading}
          href="/dashboard/student/exams"
        />
      </section>

      {/* Exam History + System Readiness */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <ExamHistoryTable history={examHistory} isLoading={isLoadingSubmissions} />
        <SystemReadinessCard />
      </section>

      {/* Recent Activity */}
      <RecentActivityCard activity={recentActivity} isLoading={isLoadingSubmissions} />
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

const hoverBorderClasses: Record<"teal" | "sky" | "rose" | "violet" | "amber", string> = {
  teal: "hover:border-accent-teal/50",
  sky: "hover:border-accent-sky/50",
  rose: "hover:border-accent-rose/50",
  violet: "hover:border-accent-violet/50",
  amber: "hover:border-accent-amber/50",
};

function StudentStatsCards({
  stats,
  performance,
  isLoading,
}: {
  stats: { liveCount: number; todayCount: number; upcomingCount: number };
  performance: { completedCount: number; averageScore: number | null };
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="flex items-start gap-4 p-5">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-surface-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
              <div className="h-6 w-14 animate-pulse rounded bg-surface-muted" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<PlayCircle className="h-5 w-5" strokeWidth={1.75} />}
        label="Live Exams"
        value={stats.liveCount}
        hint="Exams open for entry"
        accent="rose"
      />
      <StatCard
        icon={<CalendarClock className="h-5 w-5" strokeWidth={1.75} />}
        label="Upcoming Exams"
        value={stats.upcomingCount}
        hint="Scheduled soon"
        accent="sky"
      />
      <StatCard
        icon={<CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />}
        label="Completed Exams"
        value={performance.completedCount}
        hint="Exams completed"
        accent="teal"
      />
      <StatCard
        icon={<BarChart3 className="h-5 w-5" strokeWidth={1.75} />}
        label="Average Score"
        value={performance.averageScore !== null ? `${performance.averageScore}%` : "—"}
        hint={performance.averageScore === null ? "No graded exams yet" : "Across all exams"}
        accent="violet"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint: string;
  accent: "teal" | "sky" | "rose" | "violet" | "amber";
}) {
  return (
    <Card
      className={cn(
        "group flex items-start gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sky",
        hoverBorderClasses[accent]
      )}
    >
      <div
        className={cn(
          "relative rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105",
          accentIconClasses[accent]
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-paper">{value}</p>
        <p className="mt-0.5 text-xs text-muted">{hint}</p>
      </div>
    </Card>
  );
}

function ExamHeroCard({ exam }: { exam: StudentExamCardData }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const isLive = exam.availability === "live";
  const isUpcoming = exam.availability === "upcoming";

  async function handleStart() {
    setIsStarting(true);
    try {
      const session = await examSessionService.startSession(exam.id);
      router.push(`/exam-session/${session.id}`);
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
      setIsStarting(false);
    }
  }

  return (
    <Card
      interactive
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden p-4",
        isLive && "border-accent-teal/50"
      )}
    >
      {isLive && (
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-teal/10 blur-3xl" />
      )}

      {isLive ? (
        <span className="relative flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-accent-teal/30 bg-accent-teal/10 px-2 py-0.5 text-[10px] font-semibold text-accent-teal">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal" />
          Live now
        </span>
      ) : (
        <span className="relative flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-accent-sky/30 bg-accent-sky/10 px-2 py-0.5 text-[10px] font-semibold text-accent-sky">
          <CalendarClock className="h-3 w-3" />
          Starts {new Date(exam.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}

      <div className="relative min-w-0">
        <p className="truncate font-display text-sm font-semibold text-paper">{exam.title}</p>
        <p className="truncate text-xs text-paper/60">{exam.subject}</p>
      </div>

      <div className="relative flex flex-col gap-1.5 text-[11px] text-paper/50">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          {isUpcoming
            ? new Date(exam.startTime).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : new Date(exam.startTime).toLocaleDateString(undefined, { dateStyle: "medium" })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {exam.durationMinutes} min
        </span>
      </div>

      {isLive ? (
        <Button onClick={handleStart} isLoading={isStarting} className="relative mt-1 h-9 w-full text-xs">
          <PlayCircle className="h-4 w-4" />
          Start exam
        </Button>
      ) : (
        <Link href="/dashboard/student/exams" className="relative mt-1">
          <Button variant="secondary" className="h-9 w-full text-xs">
            <Info className="h-4 w-4" />
            View details
          </Button>
        </Link>
      )}
    </Card>
  );
}


function RecentResultsCard({
  results,
  isLoading,
}: {
  results: MySubmissionListItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-full min-h-[220px] animate-pulse rounded-2xl border border-border bg-surface-muted" />;
  }

  if (results.length === 0) {
    return (
      <EmptyStateCard
        icon={BarChart3}
        title="Recent results"
        description="Once your exams are graded, your latest scores will show up right here."
        footnote="Awaiting graded exams"
        accent="sky"
      />
    );
  }

  return (
    <Card interactive className="flex h-full flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-semibold text-paper">Recent Results</p>
        <Link href="/dashboard/student/history" className="text-xs font-medium text-accent-sky hover:text-accent-sky/80">
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {results.map((r) => {
          const percent = r.maxMarks > 0 ? Math.round((r.totalMarks / r.maxMarks) * 100) : null;
          return (
            <Link
              key={r.id}
              href={`/dashboard/student/report/${r.id}`}
              className="flex items-center justify-between rounded-xl border border-border p-3.5 transition-colors hover:bg-white/5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-paper">{r.examTitle}</p>
                <p className="text-xs text-paper/50">{r.examSubject}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold text-paper">
                  {r.totalMarks}/{r.maxMarks}
                </span>
                {percent !== null && (
                  <span className="rounded-full bg-accent-teal/10 px-2 py-0.5 text-xs font-semibold text-accent-teal">
                    {percent}%
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
