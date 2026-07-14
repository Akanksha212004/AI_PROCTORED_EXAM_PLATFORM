// // "use client";

// // import { FileQuestion } from "lucide-react";
// // import Link from "next/link";

// // import { RoleGuard } from "@/components/auth/RoleGuard";
// // import { DashboardShell } from "@/components/layout/DashboardShell";
// // import { Card } from "@/components/ui/Card";
// // import { useAuth } from "@/hooks/useAuth";

// // export default function ExaminerDashboardPage() {
// //   return (
// //     <RoleGuard allowedRole="EXAMINER">
// //       <DashboardShell>
// //         <ExaminerDashboardContent />
// //       </DashboardShell>
// //     </RoleGuard>
// //   );
// // }

// // function ExaminerDashboardContent() {
// //   const { user } = useAuth();

// //   return (
// //     <div>
// //       <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
// //         Examiner Dashboard
// //       </p>
// //       <h1 className="font-display text-3xl font-semibold text-paper">Welcome, {user?.name}</h1>
// //       <p className="mt-2 text-sm text-paper/60">
// //         Manage your question bank and, soon, exam configuration from here.
// //       </p>

// //       <Link href="/dashboard/examiner/questions" className="mt-8 block">
// //         <Card className="flex items-center gap-4 transition-colors hover:border-accent-sky">
// //           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10">
// //             <FileQuestion className="h-5 w-5 text-accent-sky" strokeWidth={2} />
// //           </div>
// //           <div>
// //             <p className="font-medium text-paper">Question Bank</p>
// //             <p className="text-sm text-paper/60">Create, organize, and manage exam questions.</p>
// //           </div>
// //         </Card>
// //       </Link>
// //     </div>
// //   );
// // }





// "use client";

// import { FileQuestion, ClipboardList } from "lucide-react";
// import Link from "next/link";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { Card } from "@/components/ui/Card";
// import { useAuth } from "@/hooks/useAuth";

// export default function ExaminerDashboardPage() {
//   return (
//     <RoleGuard allowedRole="EXAMINER">
//       <DashboardShell>
//         <ExaminerDashboardContent />
//       </DashboardShell>
//     </RoleGuard>
//   );
// }

// function ExaminerDashboardContent() {
//   const { user } = useAuth();

//   return (
//     <div>
//       <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
//         Examiner Dashboard
//       </p>
//       <h1 className="font-display text-3xl font-semibold text-paper">Welcome, {user?.name}</h1>
//       <p className="mt-2 text-sm text-paper/60">
//         Manage your question bank and exam configuration from here.
//       </p>

//       <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
//         <Link href="/dashboard/examiner/questions">
//           <Card className="flex items-center gap-4 transition-colors hover:border-accent-sky">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10">
//               <FileQuestion className="h-5 w-5 text-accent-sky" strokeWidth={2} />
//             </div>
//             <div>
//               <p className="font-medium text-paper">Question Bank</p>
//               <p className="text-sm text-paper/60">Create, organize, and manage exam questions.</p>
//             </div>
//           </Card>
//         </Link>

//         <Link href="/dashboard/examiner/exams">
//           <Card className="flex items-center gap-4 transition-colors hover:border-accent-sky">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10">
//               <ClipboardList className="h-5 w-5 text-accent-sky" strokeWidth={2} />
//             </div>
//             <div>
//               <p className="font-medium text-paper">Exam Configuration</p>
//               <p className="text-sm text-paper/60">Set up exams, proctoring rules, and question selection.</p>
//             </div>
//           </Card>
//         </Link>
//       </div>
//     </div>
//   );
// }






// "use client";

// import { FileQuestion, ClipboardList, ClipboardCheck, Plus, Radio } from "lucide-react";
// import Link from "next/link";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { Card } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { useAuth } from "@/hooks/useAuth";
// import { useDashboardSummary } from "@/hooks/useDashboardSummary";
// import { ExaminerStatsCards } from "@/components/dashboard/ExaminerStatsCards";
// import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
// import { UpcomingExamsCard } from "@/components/dashboard/UpcomingExamsCard";

// export default function ExaminerDashboardPage() {
//   return (
//     <RoleGuard allowedRole="EXAMINER">
//       <DashboardShell>
//         <ExaminerDashboardContent />
//       </DashboardShell>
//     </RoleGuard>
//   );
// }

// function ExaminerDashboardContent() {
//   const { user } = useAuth();
//   const { summary, isLoading } = useDashboardSummary();

//   return (
//     <div className="space-y-8">
//       <div>
//         <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
//           Examiner Dashboard
//         </p>
//         <h1 className="font-display text-3xl font-semibold text-paper">Welcome, {user?.name}</h1>
//         <p className="mt-2 text-sm text-paper/60">
//           Manage your question bank, exam configuration, and student submissions from here.
//         </p>
//       </div>

//       <ExaminerStatsCards summary={summary} isLoading={isLoading} />

//       {/* Quick access — 4 cards now, Live Sessions added */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         <Link href="/dashboard/examiner/questions">
//           <Card className="flex items-center gap-4 transition-colors hover:border-accent-sky">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10">
//               <FileQuestion className="h-5 w-5 text-accent-sky" strokeWidth={2} />
//             </div>
//             <div>
//               <p className="font-medium text-paper">Question Bank</p>
//               <p className="text-sm text-paper/60">Create, organize, and manage exam questions.</p>
//             </div>
//           </Card>
//         </Link>

//         <Link href="/dashboard/examiner/exams">
//           <Card className="flex items-center gap-4 transition-colors hover:border-accent-sky">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10">
//               <ClipboardList className="h-5 w-5 text-accent-sky" strokeWidth={2} />
//             </div>
//             <div>
//               <p className="font-medium text-paper">Exam Configuration</p>
//               <p className="text-sm text-paper/60">Set up exams, proctoring rules, and question selection.</p>
//             </div>
//           </Card>
//         </Link>

//         <Link href="/dashboard/examiner/submissions">
//           <Card className="flex items-center gap-4 transition-colors hover:border-accent-sky">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10">
//               <ClipboardCheck className="h-5 w-5 text-accent-sky" strokeWidth={2} />
//             </div>
//             <div>
//               <p className="font-medium text-paper">Submissions</p>
//               <p className="text-sm text-paper/60">Review auto-scores and grade subjective answers.</p>
//             </div>
//           </Card>
//         </Link>

//         <Link href="/dashboard/examiner/live-sessions">
//           <Card className="flex items-center gap-4 transition-colors hover:border-accent-sky">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-sky/10">
//               <Radio className="h-5 w-5 text-accent-sky" strokeWidth={2} />
//             </div>
//             <div>
//               <p className="font-medium text-paper">Live Sessions</p>
//               <p className="text-sm text-paper/60">Monitor students currently taking your exams.</p>
//             </div>
//           </Card>
//         </Link>
//       </div>

//       {/* Quick actions */}
//       <div className="flex flex-wrap gap-3">
//         <Link href="/dashboard/examiner/exams">
//           <Button className="w-auto px-4">
//             <Plus className="h-4 w-4" />
//             Create New Exam
//           </Button>
//         </Link>
//         <Link href="/dashboard/examiner/questions">
//           <Button variant="secondary" className="w-auto px-4">
//             <Plus className="h-4 w-4" />
//             Add Question
//           </Button>
//         </Link>
//       </div>

//       {/* Activity + upcoming */}
//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//         <RecentActivityCard activity={summary?.recentActivity ?? []} isLoading={isLoading} />
//         <UpcomingExamsCard exams={summary?.upcomingExams ?? []} isLoading={isLoading} />
//       </div>
//     </div>
//   );
// }




"use client";

import { FileQuestion, ClipboardList, ClipboardCheck, Plus, Radio, LayoutDashboard } from "lucide-react";
import Link from "next/link";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { ExaminerStatsCards } from "@/components/dashboard/ExaminerStatsCards";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { UpcomingExamsCard } from "@/components/dashboard/UpcomingExamsCard";

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
    description: "Create, organize, and manage exam questions.",
    tone: "sky",
  },
  {
    href: "/dashboard/examiner/exams",
    icon: <ClipboardList className="h-5 w-5" strokeWidth={2} />,
    title: "Exam Configuration",
    description: "Set up exams, proctoring rules, and question selection.",
    tone: "teal",
  },
  {
    href: "/dashboard/examiner/submissions",
    icon: <ClipboardCheck className="h-5 w-5" strokeWidth={2} />,
    title: "Submissions",
    description: "Review auto-scores and grade subjective answers.",
    tone: "amber",
  },
  {
    href: "/dashboard/examiner/live-sessions",
    icon: <Radio className="h-5 w-5" strokeWidth={2} />,
    title: "Live Sessions",
    description: "Monitor students currently taking your exams.",
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

function ExaminerDashboardContent() {
  const { user } = useAuth();
  const { summary, isLoading } = useDashboardSummary();

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-accent-sky">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Examiner Dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold text-paper">Welcome, {user?.name}</h1>
          <p className="mt-2 text-sm text-paper/60">
            Manage your question bank, exam configuration, and student submissions from here.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/examiner/exams">
            <Button className="w-auto px-4">
              <Plus className="h-4 w-4" />
              Create New Exam
            </Button>
          </Link>
          <Link href="/dashboard/examiner/questions">
            <Button variant="secondary" className="w-auto px-4">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      <section>
        <ExaminerStatsCards summary={summary} isLoading={isLoading} />
      </section>

      <section>
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">Quick Access</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACCESS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card
                className={cn(
                  "flex h-full items-center gap-4 transition-colors",
                  TONE_HOVER_BORDER[item.tone]
                )}
              >
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", TONE_ICON_BG[item.tone])}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-paper">{item.title}</p>
                  <p className="text-sm text-paper/60">{item.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RecentActivityCard activity={summary?.recentActivity ?? []} isLoading={isLoading} />
        <UpcomingExamsCard exams={summary?.upcomingExams ?? []} isLoading={isLoading} />
      </section>
    </div>
  );
}
