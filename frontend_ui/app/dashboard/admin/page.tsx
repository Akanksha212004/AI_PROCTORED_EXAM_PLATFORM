// "use client";

// // app/dashboard/admin/page.tsx

// import {
//   BarChart3,
//   ChevronRight,
//   ClipboardCheck,
//   ClipboardList,
//   FileBarChart,
//   FileQuestion,
//   Plus,
//   Radio,
//   Users,
// } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { Card } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/hooks/useAuth";
// import { useAdminDashboardSummary } from "@/hooks/useAdminDashboardSummary";
// import { AdminStatsCards } from "@/components/dashboard/AdminStatsCards";
// import { AdminRecentActivityCard } from "@/components/dashboard/AdminRecentActivityCard";
// import { UpcomingExamsCard } from "@/components/dashboard/UpcomingExamsCard";

// export default function AdminDashboardPage() {
//   return (
//     <RoleGuard allowedRole="ADMIN">
//       <DashboardShell>
//         <AdminDashboardContent />
//       </DashboardShell>
//     </RoleGuard>
//   );
// }

// interface QuickAccessCard {
//   href: string;
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   tone: "sky" | "teal" | "amber" | "rose" | "violet";
// }

// const QUICK_ACCESS: QuickAccessCard[] = [
//   {
//     href: "/dashboard/admin/users",
//     icon: <Users className="h-5 w-5" strokeWidth={2} />,
//     title: "User Management",
//     description: "Students, examiners, admins",
//     tone: "rose",
//   },
//   {
//     href: "/dashboard/admin/exams",
//     icon: <ClipboardList className="h-5 w-5" strokeWidth={2} />,
//     title: "Exam Configuration",
//     description: "Every exam, any examiner",
//     tone: "teal",
//   },
//   {
//     href: "/dashboard/admin/questions",
//     icon: <FileQuestion className="h-5 w-5" strokeWidth={2} />,
//     title: "Question Bank",
//     description: "Platform-wide question pool",
//     tone: "sky",
//   },
//   {
//     href: "/dashboard/admin/submissions",
//     icon: <ClipboardCheck className="h-5 w-5" strokeWidth={2} />,
//     title: "Submissions",
//     description: "Review and grade",
//     tone: "amber",
//   },
//   {
//     href: "/dashboard/admin/live-sessions",
//     icon: <Radio className="h-5 w-5" strokeWidth={2} />,
//     title: "Live Sessions",
//     description: "Monitor active exams",
//     tone: "violet",
//   },
//   {
//     href: "/dashboard/admin/reports",
//     icon: <FileBarChart className="h-5 w-5" strokeWidth={2} />,
//     title: "Reports",
//     description: "Exam-level results",
//     tone: "teal",
//   },
//   {
//     href: "/dashboard/admin/analytics",
//     icon: <BarChart3 className="h-5 w-5" strokeWidth={2} />,
//     title: "Analytics",
//     description: "Platform-wide trends",
//     tone: "sky",
//   },
// ];

// const TONE_ICON_BG: Record<QuickAccessCard["tone"], string> = {
//   sky: "bg-accent-sky/10 text-accent-sky",
//   teal: "bg-accent-teal/10 text-accent-teal",
//   amber: "bg-amber-500/10 text-amber-400",
//   rose: "bg-accent-rose/10 text-accent-rose",
//   violet: "bg-accent-violet/10 text-accent-violet",
// };

// const TONE_HOVER_BORDER: Record<QuickAccessCard["tone"], string> = {
//   sky: "hover:border-accent-sky",
//   teal: "hover:border-accent-teal",
//   amber: "hover:border-amber-500",
//   rose: "hover:border-accent-rose",
//   violet: "hover:border-accent-violet",
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

// function AdminDashboardContent() {
//   const { user } = useAuth();
//   const { summary, isLoading } = useAdminDashboardSummary();
//   const greeting = useGreeting();

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-rose">Admin Dashboard</p>
//           <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
//             {greeting}, {user?.name} <span aria-hidden="true">👋</span>
//           </h1>
//           <p className="mt-1.5 text-sm text-paper/60">Platform-wide controls for users, exams, and proctoring oversight.</p>
//         </div>
//         <div className="flex flex-wrap gap-3">
//           <Link href="/dashboard/admin/users">
//             <Button className="w-auto px-4 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0">
//               <Plus className="h-4 w-4" />
//               Create Account
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* Stats */}
//       <AdminStatsCards summary={summary} isLoading={isLoading} />

//       {/* Quick access */}
//       <section>
//         <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">Quick Access</p>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           {QUICK_ACCESS.map((item) => (
//             <Link key={item.href} href={item.href}>
//               <Card interactive className={cn("group flex h-full items-center gap-4", TONE_HOVER_BORDER[item.tone])}>
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

//       {/* Upcoming exams + recent activity */}
//       {/* <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.4fr]">
//         <div className="min-w-0">
//           <UpcomingExamsCard
//             exams={summary?.upcomingExams ?? []}
//             isLoading={isLoading}
//             href="/dashboard/admin/exams"
//           />
//         </div>
//         <div className="min-w-0">
//           <AdminRecentActivityCard activity={summary?.recentActivity ?? []} isLoading={isLoading} />
//         </div>
//       </section> */}

//       <section className="space-y-5">
//         <UpcomingExamsCard
//           exams={summary?.upcomingExams ?? []}
//           isLoading={isLoading}
//           href="/dashboard/admin/exams"
//         />
//         <AdminRecentActivityCard activity={summary?.recentActivity ?? []} isLoading={isLoading} />
//       </section>
      
//     </div>
//   );
// }







"use client";

// app/dashboard/admin/page.tsx

import {
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileQuestion,
  Plus,
  Radio,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useAdminDashboardSummary } from "@/hooks/useAdminDashboardSummary";
import { AdminStatsCards } from "@/components/dashboard/AdminStatsCards";
import { AdminRecentActivityCard } from "@/components/dashboard/AdminRecentActivityCard";
import { UpcomingExamsCard } from "@/components/dashboard/UpcomingExamsCard";

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRole="ADMIN">
      <DashboardShell>
        <AdminDashboardContent />
      </DashboardShell>
    </RoleGuard>
  );
}

interface QuickAccessCard {
  href: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  tone: "sky" | "teal" | "amber" | "rose" | "violet";
}

const QUICK_ACCESS: QuickAccessCard[] = [
  {
    href: "/dashboard/admin/users",
    icon: <Users className="h-5 w-5" strokeWidth={2} />,
    titleKey: "admin.dashboard.quickAccessItems.users.title",
    descriptionKey: "admin.dashboard.quickAccessItems.users.description",
    tone: "rose",
  },
  {
    href: "/dashboard/admin/exams",
    icon: <ClipboardList className="h-5 w-5" strokeWidth={2} />,
    titleKey: "admin.dashboard.quickAccessItems.exams.title",
    descriptionKey: "admin.dashboard.quickAccessItems.exams.description",
    tone: "teal",
  },
  {
    href: "/dashboard/admin/questions",
    icon: <FileQuestion className="h-5 w-5" strokeWidth={2} />,
    titleKey: "admin.dashboard.quickAccessItems.questions.title",
    descriptionKey: "admin.dashboard.quickAccessItems.questions.description",
    tone: "sky",
  },
  {
    href: "/dashboard/admin/submissions",
    icon: <ClipboardCheck className="h-5 w-5" strokeWidth={2} />,
    titleKey: "admin.dashboard.quickAccessItems.submissions.title",
    descriptionKey: "admin.dashboard.quickAccessItems.submissions.description",
    tone: "amber",
  },
  {
    href: "/dashboard/admin/live-sessions",
    icon: <Radio className="h-5 w-5" strokeWidth={2} />,
    titleKey: "admin.dashboard.quickAccessItems.liveSessions.title",
    descriptionKey: "admin.dashboard.quickAccessItems.liveSessions.description",
    tone: "violet",
  },
  {
    href: "/dashboard/admin/reports",
    icon: <FileBarChart className="h-5 w-5" strokeWidth={2} />,
    titleKey: "admin.dashboard.quickAccessItems.reports.title",
    descriptionKey: "admin.dashboard.quickAccessItems.reports.description",
    tone: "teal",
  },
  {
    href: "/dashboard/admin/analytics",
    icon: <BarChart3 className="h-5 w-5" strokeWidth={2} />,
    titleKey: "admin.dashboard.quickAccessItems.analytics.title",
    descriptionKey: "admin.dashboard.quickAccessItems.analytics.description",
    tone: "sky",
  },
];

const TONE_ICON_BG: Record<QuickAccessCard["tone"], string> = {
  sky: "bg-accent-sky/10 text-accent-sky",
  teal: "bg-accent-teal/10 text-accent-teal",
  amber: "bg-amber-500/10 text-amber-400",
  rose: "bg-accent-rose/10 text-accent-rose",
  violet: "bg-accent-violet/10 text-accent-violet",
};

const TONE_HOVER_BORDER: Record<QuickAccessCard["tone"], string> = {
  sky: "hover:border-accent-sky",
  teal: "hover:border-accent-teal",
  amber: "hover:border-amber-500",
  rose: "hover:border-accent-rose",
  violet: "hover:border-accent-violet",
};

/** Time-of-day greeting, computed client-side after mount to avoid SSR/client hydration mismatches. */
function useGreeting(t: (key: string) => string) {
  const [greetingKey, setGreetingKey] = useState("dashboard.examiner.greetingDefault");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreetingKey(
      hour < 12
        ? "dashboard.examiner.greetingMorning"
        : hour < 17
          ? "dashboard.examiner.greetingAfternoon"
          : "dashboard.examiner.greetingEvening"
    );
  }, []);
  return t(greetingKey);
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { summary, isLoading } = useAdminDashboardSummary();
  const greeting = useGreeting(t);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-accent-rose">
            {t("admin.dashboard.eyebrow")}
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
            {greeting}, {user?.name} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1.5 text-sm text-paper/60">{t("admin.dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/admin/users">
            <Button className="w-auto px-4 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0">
              <Plus className="h-4 w-4" />
              {t("admin.dashboard.createAccount")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <AdminStatsCards summary={summary} isLoading={isLoading} />

      {/* Quick access */}
      <section>
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">
          {t("admin.dashboard.quickAccess")}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACCESS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card interactive className={cn("group flex h-full items-center gap-4", TONE_HOVER_BORDER[item.tone])}>
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", TONE_ICON_BG[item.tone])}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-paper">{t(item.titleKey)}</p>
                  <p className="text-sm text-paper/60">{t(item.descriptionKey)}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-paper/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-paper/60" />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming exams + recent activity */}
      {/* <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.4fr]">
        <div className="min-w-0">
          <UpcomingExamsCard
            exams={summary?.upcomingExams ?? []}
            isLoading={isLoading}
            href="/dashboard/admin/exams"
          />
        </div>
        <div className="min-w-0">
          <AdminRecentActivityCard activity={summary?.recentActivity ?? []} isLoading={isLoading} />
        </div>
      </section> */}

      <section className="space-y-5">
        <UpcomingExamsCard
          exams={summary?.upcomingExams ?? []}
          isLoading={isLoading}
          href="/dashboard/admin/exams"
        />
        <AdminRecentActivityCard activity={summary?.recentActivity ?? []} isLoading={isLoading} />
      </section>
      
    </div>
  );
}
