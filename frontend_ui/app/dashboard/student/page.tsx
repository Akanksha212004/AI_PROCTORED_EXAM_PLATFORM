// "use client";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { Card } from "@/components/ui/Card";
// import { useAuth } from "@/hooks/useAuth";

// import Link from "next/link";
// import { FileText } from "lucide-react";

// export default function StudentDashboardPage() {
//   return (
//     <RoleGuard allowedRole="STUDENT">
//       <DashboardShell>
//         <StudentDashboardContent />
//       </DashboardShell>
//     </RoleGuard>
//   );
// }

// function StudentDashboardContent() {
//   const { user } = useAuth();

//   return (
//     <div>
//       <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-teal">
//         Student Dashboard
//       </p>
//       <h1 className="font-display text-3xl font-semibold text-paper">Welcome, {user?.name}</h1>
//       <p className="mt-2 text-sm text-paper/60">
//         Your upcoming exams and results will appear here once the Exam Engine module ships.
//       </p>

//       <Card className="mt-8">
//         <p className="text-sm text-paper/70">
//           No exams scheduled yet. Check back after your examiner publishes an exam.
//         </p>
//       </Card>
//     </div>
//   );
// }




"use client";

// app/dashboard/student/page.tsx

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  History,
  LogOut,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyStateCard } from "@/components/dashboard/EmptyStateCard";
import { UpcomingExamsCard } from "@/components/dashboard/UpcomingExamsCard";
import { useAuth } from "@/hooks/useAuth";
import {
  useStudentDashboard,
  type StudentExamCardData,
} from "@/hooks/useStudentDashboard";
import { examSessionService } from "@/services/examSessionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import { cn } from "@/lib/utils";

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
  const { user, logout } = useAuth();
  const { isLoading, todaysExams, upcomingExams, stats } = useStudentDashboard();

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const greeting = getGreeting(new Date());

  return (
    <div className="space-y-10 pb-4">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-teal">
            <Sparkles className="h-3.5 w-3.5" />
            Student Dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold text-paper sm:text-4xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-2 text-sm text-paper/60">
            {stats.liveCount > 0
              ? `${stats.liveCount} exam${stats.liveCount === 1 ? "" : "s"} live right now.`
              : stats.todayCount > 0
              ? `${stats.todayCount} exam${stats.todayCount === 1 ? "" : "s"} scheduled today.`
              : "Nothing on your plate right now — you're all caught up."}
          </p>
        </div>

        <Link href="/dashboard/student/exams">
          <Button className="w-auto px-5">
            <BookOpen className="h-4 w-4" />
            Browse all exams
          </Button>
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[84px] animate-pulse rounded-2xl border border-border bg-surface-muted"
              />
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="Live now"
              value={stats.liveCount}
              icon={PlayCircle}
              accent="rose"
              hint="Exams open for entry"
            />
            <StatCard
              label="Today"
              value={stats.todayCount}
              icon={CalendarClock}
              accent="teal"
              hint="Scheduled for today"
            />
            <StatCard
              label="Upcoming"
              value={stats.upcomingCount}
              icon={BarChart3}
              accent="sky"
              hint="Later this term"
            />
          </>
        )}
      </div>

      {/* Today's Exams — primary focus of the page */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-paper">Today&apos;s Exams</h2>
          <Link
            href="/dashboard/student/exams"
            className="text-sm font-medium text-accent-sky transition-colors hover:text-accent-sky/80"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-border bg-surface-muted"
              />
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {todaysExams.map((exam) => (
              <ExamHeroCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming exams — reuses the shared UpcomingExamsCard */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-paper">Coming up</h2>
        <UpcomingExamsCard
          exams={upcomingExams.slice(0, 5)}
          isLoading={isLoading}
          href="/dashboard/student/exams"
        />
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-paper">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            icon={BookOpen}
            title="Browse exams"
            description="See every exam you can take now or later."
            href="/dashboard/student/exams"
            accent="teal"
          />
          <ActionCard
            icon={History}
            title="Exam history"
            description="Past attempts will appear here once this is available."
            accent="sky"
            disabled
          />
          <ActionCard
            icon={BarChart3}
            title="Performance analytics"
            description="Score trends will appear here once this is available."
            accent="rose"
            disabled
          />
        </div>
      </section>

      {/* Future-ready sections — no backend support yet */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-paper">Your progress</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EmptyStateCard
            icon={BarChart3}
            title="Recent results"
            description="Once your exams are graded, your latest scores will show up right here."
            footnote="Awaiting graded exams"
            accent="sky"
          />
          <EmptyStateCard
            icon={Sparkles}
            title="Performance analytics"
            description="We'll chart your score trends and subject strengths as soon as you have graded results to draw from."
            footnote="Awaiting graded exams"
            accent="teal"
          />
          <EmptyStateCard
            icon={History}
            title="Exam history"
            description="Every exam you complete — live, auto-submitted, or scored — will be logged here for easy reference."
            footnote="Awaiting first submission"
            accent="rose"
          />
          <EmptyStateCard
            icon={ShieldCheck}
            title="Proctoring & system readiness"
            description="Camera and microphone checks aren't reported outside an active exam session yet. You'll be guided through a readiness check the moment you start one."
            footnote="Unavailable outside a session"
            accent="sky"
          />
        </div>
      </section>

      {/* <button
        onClick={logout}
        className="inline-flex items-center gap-2 text-sm font-medium text-paper/50 transition-colors hover:text-accent-rose"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button> */}
    </div>
  );
}

const accentIconClasses: Record<"teal" | "sky" | "rose", string> = {
  teal: "from-accent-teal/20 to-accent-teal/5 text-accent-teal",
  sky: "from-accent-sky/20 to-accent-sky/5 text-accent-sky",
  rose: "from-accent-rose/20 to-accent-rose/5 text-accent-rose",
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: "teal" | "sky" | "rose";
  hint: string;
}) {
  return (
    <Card interactive className="flex items-center gap-4 p-5">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
          accentIconClasses[accent]
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-paper">{value}</p>
        <p className="text-sm font-medium text-paper/70">{label}</p>
        <p className="text-xs text-paper/40">{hint}</p>
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
        "relative flex flex-col gap-4 overflow-hidden p-6",
        isLive && "border-accent-teal/50"
      )}
    >
      {isLive && (
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-teal/10 blur-3xl" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-paper">{exam.title}</p>
          <p className="text-sm text-paper/60">{exam.subject}</p>
        </div>
        {isLive && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-accent-teal/30 bg-accent-teal/10 px-2.5 py-1 text-xs font-semibold text-accent-teal">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal" />
            Live now
          </span>
        )}
      </div>

      <div className="relative flex items-center gap-4 text-xs text-paper/50">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" />
          {isUpcoming
            ? `Starts ${new Date(exam.startTime).toLocaleString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : new Date(exam.startTime).toLocaleDateString()}
        </span>
        <span>{exam.durationMinutes} min</span>
      </div>

      <Button
        onClick={handleStart}
        disabled={!isLive}
        isLoading={isStarting}
        className="relative mt-1 w-auto px-4"
      >
        <PlayCircle className="h-4 w-4" />
        {isLive ? "Start exam" : "Starts later today"}
      </Button>
    </Card>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  accent,
  href,
  disabled,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "teal" | "sky" | "rose";
  href?: string;
  disabled?: boolean;
}) {
  const content = (
    <Card
      interactive={!disabled}
      className={cn(
        "flex h-full flex-col gap-3 p-5",
        disabled && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
            accentIconClasses[accent]
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        {disabled && (
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paper/40">
            Coming soon
          </span>
        )}
      </div>
      <div>
        <p className="font-medium text-paper">{title}</p>
        <p className="mt-1 text-sm text-paper/55">{description}</p>
      </div>
    </Card>
  );

  if (disabled || !href) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}