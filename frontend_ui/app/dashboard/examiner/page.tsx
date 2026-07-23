// "use client";

// import { ChevronRight, ClipboardCheck, ClipboardList, FileQuestion, Plus, Radio } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { Card } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/hooks/useAuth";
// import { useDashboardSummary } from "@/hooks/useDashboardSummary";
// import { ExaminerStatsCards } from "@/components/dashboard/ExaminerStatsCards";
// import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
// import { RecentSubmissionsCard } from "@/components/dashboard/RecentSubmissionsCard";
// import { ExamOverviewCard } from "@/components/dashboard/ExamOverviewCard";

// export default function ExaminerDashboardPage() {
//   return (
//     <RoleGuard allowedRole="EXAMINER">
//       <DashboardShell>
//         <ExaminerDashboardContent />
//       </DashboardShell>
//     </RoleGuard>
//   );
// }

// interface QuickAccessCard {
//   href: string;
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   tone: "sky" | "teal" | "amber" | "rose";
// }

// const QUICK_ACCESS: QuickAccessCard[] = [
//   {
//     href: "/dashboard/examiner/questions",
//     icon: <FileQuestion className="h-5 w-5" strokeWidth={2} />,
//     title: "Question Bank",
//     description: "Manage questions",
//     tone: "sky",
//   },
//   {
//     href: "/dashboard/examiner/exams",
//     icon: <ClipboardList className="h-5 w-5" strokeWidth={2} />,
//     title: "Exam Configuration",
//     description: "Rules and settings",
//     tone: "teal",
//   },
//   {
//     href: "/dashboard/examiner/submissions",
//     icon: <ClipboardCheck className="h-5 w-5" strokeWidth={2} />,
//     title: "Submissions",
//     description: "Review and grade",
//     tone: "amber",
//   },
//   {
//     href: "/dashboard/examiner/live-sessions",
//     icon: <Radio className="h-5 w-5" strokeWidth={2} />,
//     title: "Live Sessions",
//     description: "Monitor students",
//     tone: "rose",
//   },
// ];

// const TONE_ICON_BG: Record<QuickAccessCard["tone"], string> = {
//   sky: "bg-accent-sky/10 text-accent-sky",
//   teal: "bg-accent-teal/10 text-accent-teal",
//   amber: "bg-amber-500/10 text-amber-400",
//   rose: "bg-accent-rose/10 text-accent-rose",
// };

// const TONE_HOVER_BORDER: Record<QuickAccessCard["tone"], string> = {
//   sky: "hover:border-accent-sky",
//   teal: "hover:border-accent-teal",
//   amber: "hover:border-amber-500",
//   rose: "hover:border-accent-rose",
// };

// /** Time-of-day greeting, computed client-side after mount to avoid SSR/client hydration mismatches. */
// function useGreeting() {
//   const [greeting, setGreeting] = useState("Welcome");
//   useEffect(() => {
//     const hour = new Date().getHours();
//     setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
//   }, []);
//   return greeting;
// }

// function ExaminerDashboardContent() {
//   const { user } = useAuth();
//   const { summary, isLoading } = useDashboardSummary();
//   const greeting = useGreeting();

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
//             {greeting}, {user?.name} <span aria-hidden="true">👋</span>
//           </h1>
//           <p className="mt-1.5 text-sm text-paper/60">Here&apos;s what&apos;s happening with your exams today.</p>
//         </div>
//         <div className="flex flex-wrap gap-3">
//           <Link href="/dashboard/examiner/exams">
//             <Button className="w-auto px-4 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0">
//               <Plus className="h-4 w-4" />
//               Create Exam
//             </Button>
//           </Link>
//           <Link href="/dashboard/examiner/questions">
//             <Button
//               variant="secondary"
//               className="w-auto px-4 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
//             >
//               <Plus className="h-4 w-4" />
//               Add Question
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* Stats */}
//       <ExaminerStatsCards summary={summary} isLoading={isLoading} />

//       {/* Quick access */}
//       <section>
//         <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">Quick Access</p>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           {QUICK_ACCESS.map((item) => (
//             <Link key={item.href} href={item.href}>
//               <Card
//                 interactive
//                 className={cn("group flex h-full items-center gap-4", TONE_HOVER_BORDER[item.tone])}
//               >
//                 <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", TONE_ICON_BG[item.tone])}>
//                   {item.icon}
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-paper">{item.title}</p>
//                   <p className="text-sm text-paper/60">{item.description}</p>
//                 </div>
//                 <ChevronRight className="h-4 w-4 shrink-0 text-paper/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-paper/60" />
//               </Card>
//             </Link>
//           ))}
//         </div>
//       </section>

//       {/* Exam overview + recent submissions */}
//       <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
//         <ExamOverviewCard />
//         <RecentSubmissionsCard />
//       </section>

//       {/* Recent activity */}
//       <RecentActivityCard activity={summary?.recentActivity ?? []} isLoading={isLoading} />
//     </div>
//   );
// }







"use client";

import { ChevronRight, ClipboardCheck, ClipboardList, FileQuestion, Plus, Radio } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { ExaminerStatsCards } from "@/components/dashboard/ExaminerStatsCards";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { RecentSubmissionsCard } from "@/components/dashboard/RecentSubmissionsCard";
import { ExamOverviewCard } from "@/components/dashboard/ExamOverviewCard";

export default function ExaminerDashboardPage() {
  return (
    <RoleGuard allowedRole="EXAMINER">
      <DashboardShell>
        <ExaminerDashboardContent />
      </DashboardShell>
    </RoleGuard>
  );
}

interface QuickAccessCard {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: "sky" | "teal" | "amber" | "rose";
}

const QUICK_ACCESS: QuickAccessCard[] = [
  {
    href: "/dashboard/examiner/questions",
    icon: <FileQuestion className="h-5 w-5" strokeWidth={2} />,
    title: "Question Bank",
    description: "Manage questions",
    tone: "sky",
  },
  {
    href: "/dashboard/examiner/exams",
    icon: <ClipboardList className="h-5 w-5" strokeWidth={2} />,
    title: "Exam Configuration",
    description: "Rules and settings",
    tone: "teal",
  },
  {
    href: "/dashboard/examiner/submissions",
    icon: <ClipboardCheck className="h-5 w-5" strokeWidth={2} />,
    title: "Submissions",
    description: "Review and grade",
    tone: "amber",
  },
  {
    href: "/dashboard/examiner/live-sessions",
    icon: <Radio className="h-5 w-5" strokeWidth={2} />,
    title: "Live Sessions",
    description: "Monitor students",
    tone: "rose",
  },
];

const TONE_ICON_BG: Record<QuickAccessCard["tone"], string> = {
  sky: "bg-accent-sky/10 text-accent-sky",
  teal: "bg-accent-teal/10 text-accent-teal",
  amber: "bg-amber-500/10 text-amber-400",
  rose: "bg-accent-rose/10 text-accent-rose",
};

const TONE_HOVER_BORDER: Record<QuickAccessCard["tone"], string> = {
  sky: "hover:border-accent-sky",
  teal: "hover:border-accent-teal",
  amber: "hover:border-amber-500",
  rose: "hover:border-accent-rose",
};

/** Time-of-day greeting, computed client-side after mount to avoid SSR/client hydration mismatches. */
function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return greeting;
}

function ExaminerDashboardContent() {
  const { user } = useAuth();
  const { summary, isLoading } = useDashboardSummary();
  const greeting = useGreeting();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
            {greeting}, {user?.name} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1.5 text-sm text-paper/60">Here&apos;s what&apos;s happening with your exams today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/examiner/exams">
            <Button className="w-auto px-4 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0">
              <Plus className="h-4 w-4" />
              Create Exam
            </Button>
          </Link>
          <Link href="/dashboard/examiner/questions">
            <Button
              variant="secondary"
              className="w-auto px-4 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <ExaminerStatsCards summary={summary} isLoading={isLoading} />

      {/* Quick access */}
      <section>
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">Quick Access</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACCESS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card
                interactive
                className={cn("group flex h-full items-center gap-4", TONE_HOVER_BORDER[item.tone])}
              >
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", TONE_ICON_BG[item.tone])}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-paper">{item.title}</p>
                  <p className="text-sm text-paper/60">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-paper/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-paper/60" />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Exam overview + recent submissions */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <ExamOverviewCard />
        <RecentSubmissionsCard />
      </section>

      {/* Recent activity */}
      <RecentActivityCard activity={summary?.recentActivity ?? []} isLoading={isLoading} />
    </div>
  );
}
