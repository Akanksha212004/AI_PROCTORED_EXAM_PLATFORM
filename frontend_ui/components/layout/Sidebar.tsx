
"use client";

import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Radio,
  Settings,
  ShieldCheck,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  /** Only match this exact path (used for dashboard "home" links so they don't stay lit on sub-routes). */
  exact?: boolean;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  EXAMINER: [
    { href: "/dashboard/examiner", labelKey: "nav.dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, exact: true },
    { href: "/dashboard/examiner/questions", labelKey: "nav.questionBank", icon: <FileQuestion className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/exams", labelKey: "nav.examConfiguration", icon: <ClipboardList className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/submissions", labelKey: "nav.submissions", icon: <ClipboardCheck className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/live-sessions", labelKey: "nav.liveSessions", icon: <Radio className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/students", labelKey: "nav.students", icon: <Users className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/reports", labelKey: "nav.reports", icon: <FileBarChart className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/analytics", labelKey: "nav.analytics", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/examiner/settings", labelKey: "nav.settings", icon: <Settings className="h-[18px] w-[18px]" /> },
  ],
  STUDENT: [
    { href: "/dashboard/student", labelKey: "nav.dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, exact: true },
    { href: "/dashboard/student/exams", labelKey: "nav.myExams", icon: <ClipboardList className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/student/history", labelKey: "nav.results", icon: <FileBarChart className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/student/analytics", labelKey: "nav.analytics", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/student/profile", labelKey: "nav.profile", icon: <UserIcon className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/student/settings", labelKey: "nav.settings", icon: <Settings className="h-[18px] w-[18px]" /> },
  ],
  ADMIN: [
    { href: "/dashboard/admin", labelKey: "nav.dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, exact: true },
    { href: "/dashboard/admin/users", labelKey: "nav.userManagement", icon: <Users className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/admin/examiner-requests", labelKey: "nav.examinerRequests", icon: <GraduationCap className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/admin/questions", labelKey: "nav.questionBank", icon: <FileQuestion className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/admin/exams", labelKey: "nav.examConfiguration", icon: <ClipboardList className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/admin/submissions", labelKey: "nav.submissions", icon: <ClipboardCheck className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/admin/live-sessions", labelKey: "nav.liveSessions", icon: <Radio className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/admin/reports", labelKey: "nav.reports", icon: <FileBarChart className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/admin/analytics", labelKey: "nav.analytics", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
    { href: "/dashboard/admin/settings", labelKey: "nav.settings", icon: <Settings className="h-[18px] w-[18px]" /> },
  ],
};

interface Props {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = NAV_BY_ROLE[role] ?? [];

  return (
    <>
      {/* Mobile scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2 text-paper">
            <ShieldCheck className="h-5 w-5 text-accent-sky" strokeWidth={2} />
            <span className="font-display text-base font-semibold tracking-tight">{t("common.appName")}</span>
          </div>
          <button
            onClick={onClose}
            className="text-paper/60 transition-colors hover:text-paper lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-accent-sky/10 text-accent-sky"
                        : "text-paper/70 hover:bg-white/5 hover:text-paper"
                    )}
                  >
                    {item.icon}
                    {t(item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {role === "STUDENT" && (
          <div className="mx-3 mb-4 rounded-xl border border-border bg-surface-muted/40 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-accent-amber">
              <Lightbulb className="h-3.5 w-3.5" />
              {t("nav.quickTip")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-paper/60">
              {t("nav.quickTipBody")}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
