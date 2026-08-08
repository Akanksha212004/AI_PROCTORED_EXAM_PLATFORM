"use client";

import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Radio,
  Send,
  Settings,
  ShieldCheck,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useI18n } from "@/hooks/useI18n";
import { useNotifications, type NotificationItem, type NotificationType } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/types/auth";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  /** Only match this exact path (used for dashboard "home" links so they don't stay lit on sub-routes). */
  exact?: boolean;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  EXAMINER: [
    { href: "/dashboard/examiner", labelKey: "nav.dashboard", icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
    { href: "/dashboard/examiner/questions", labelKey: "nav.questionBank", icon: <FileQuestion className="h-4 w-4" /> },
    { href: "/dashboard/examiner/exams", labelKey: "nav.examConfiguration", icon: <ClipboardList className="h-4 w-4" /> },
    { href: "/dashboard/examiner/submissions", labelKey: "nav.submissions", icon: <ClipboardCheck className="h-4 w-4" /> },
    { href: "/dashboard/examiner/live-sessions", labelKey: "nav.liveSessions", icon: <Radio className="h-4 w-4" /> },
    { href: "/dashboard/examiner/students", labelKey: "nav.students", icon: <Users className="h-4 w-4" /> },
    { href: "/dashboard/examiner/reports", labelKey: "nav.reports", icon: <FileBarChart className="h-4 w-4" /> },
    { href: "/dashboard/examiner/analytics", labelKey: "nav.analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/dashboard/examiner/settings", labelKey: "nav.settings", icon: <Settings className="h-4 w-4" /> },
  ],
  STUDENT: [
    { href: "/dashboard/student", labelKey: "nav.dashboard", icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
    { href: "/dashboard/student/exams", labelKey: "nav.myExams", icon: <ClipboardList className="h-4 w-4" /> },
    { href: "/dashboard/student/history", labelKey: "nav.results", icon: <FileBarChart className="h-4 w-4" /> },
    { href: "/dashboard/student/analytics", labelKey: "nav.analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/dashboard/student/profile", labelKey: "nav.profile", icon: <UserIcon className="h-4 w-4" /> },
    { href: "/dashboard/student/settings", labelKey: "nav.settings", icon: <Settings className="h-4 w-4" /> },
  ],
  ADMIN: [
    { href: "/dashboard/admin", labelKey: "nav.dashboard", icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
    { href: "/dashboard/admin/users", labelKey: "nav.userManagement", icon: <Users className="h-4 w-4" /> },
    { href: "/dashboard/admin/examiner-requests", labelKey: "nav.examinerRequests", icon: <GraduationCap className="h-4 w-4" /> },
    { href: "/dashboard/admin/questions", labelKey: "nav.questionBank", icon: <FileQuestion className="h-4 w-4" /> },
    { href: "/dashboard/admin/exams", labelKey: "nav.examConfiguration", icon: <ClipboardList className="h-4 w-4" /> },
    { href: "/dashboard/admin/submissions", labelKey: "nav.submissions", icon: <ClipboardCheck className="h-4 w-4" /> },
    { href: "/dashboard/admin/live-sessions", labelKey: "nav.liveSessions", icon: <Radio className="h-4 w-4" /> },
    { href: "/dashboard/admin/reports", labelKey: "nav.reports", icon: <FileBarChart className="h-4 w-4" /> },
    { href: "/dashboard/admin/analytics", labelKey: "nav.analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/dashboard/admin/settings", labelKey: "nav.settings", icon: <Settings className="h-4 w-4" /> },
  ],
};

const PRIMARY_NAV_COUNT: Record<UserRole, number> = {
  STUDENT: 6,
  EXAMINER: 6,
  ADMIN: 6,
};

const ROLE_LABEL: Record<UserRole, string> = {
  STUDENT: "Student",
  EXAMINER: "Examiner",
  ADMIN: "Admin",
};

/** Thin gradient strip along the very top of the header — gives each role its own identity.
 * Sized 200% and animated with `shimmer` so it reads as a living accent, not a static bar. */
const ROLE_STRIPE: Record<UserRole, string> = {
  STUDENT: "bg-role-student bg-[length:200%_100%] animate-shimmer",
  EXAMINER: "bg-role-examiner bg-[length:200%_100%] animate-shimmer",
  ADMIN: "bg-role-admin bg-[length:200%_100%] animate-shimmer",
};

/** Gradient role pill shown next to the user's name. */
const ROLE_BADGE_GRADIENT: Record<UserRole, string> = {
  STUDENT: "bg-tone-teal",
  EXAMINER: "bg-tone-sky",
  ADMIN: "bg-tone-rose",
};

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  question_added: <FileQuestion className="h-4 w-4" />,
  exam_created: <ClipboardList className="h-4 w-4" />,
  submission: <Send className="h-4 w-4" />,
  graded: <CheckCircle2 className="h-4 w-4" />,
};

const NOTIFICATION_ICON_BG: Record<NotificationType, string> = {
  question_added: "bg-tone-sky text-white",
  exam_created: "bg-tone-teal text-white",
  submission: "bg-tone-amber text-white",
  graded: "bg-tone-violet text-white",
};

function LocalizedText({ text }: { text: string }) {
  const translated = useAutoTranslate(text);
  return <>{translated}</>;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface Props {
  user: User | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: Props) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = user ? NAV_BY_ROLE[user.role] ?? [] : [];
  const primaryCount = user ? PRIMARY_NAV_COUNT[user.role] : items.length;
  const primaryItems = items.slice(0, primaryCount);
  const moreItems = items.slice(primaryCount);
  const isExaminer = user?.role === "EXAMINER" || user?.role === "ADMIN";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname === item.href || pathname?.startsWith(`${item.href}/`);
  }

  const moreHasActiveItem = moreItems.some(isActive);

  return (
    <header className="sticky top-0 z-40 bg-header-surface/95 backdrop-blur">
      {user && <div className={cn("h-[3px] w-full", ROLE_STRIPE[user.role])} aria-hidden="true" />}

      <div className="border-b border-border">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={user ? `/dashboard/${user.role.toLowerCase()}` : "/"} className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand shadow-md shadow-accent-sky/25">
              <ShieldCheck className="h-[18px] w-[18px] text-white" strokeWidth={2} />
            </span>
            <span className="hidden font-display text-base font-semibold tracking-tight text-paper sm:inline">
              {t("common.appName")}
            </span>
          </Link>

          {/* Primary nav — evenly spaced, with overflow items tucked into "More" so
              this never has to shrink, wrap, or scroll on desktop. */}
          {user && (
            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1.5 lg:flex xl:gap-2.5">
              {primaryItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-brand text-white shadow-sm shadow-accent-sky/25"
                        : "text-paper/70 hover:bg-white/5 hover:text-paper"
                    )}
                  >
                    {item.icon}
                    <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                  </Link>
                );
              })}

              {moreItems.length > 0 && (
                <MoreMenu items={moreItems} isActive={isActive} hasActiveItem={moreHasActiveItem} t={t} />
              )}
            </nav>
          )}

          {/* Right cluster */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {user && (
              <>
                {isExaminer && <NotificationBell />}

                <div className="hidden items-center gap-2.5 lg:flex">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white shadow-sm",
                      ROLE_BADGE_GRADIENT[user.role]
                    )}
                  >
                    <LocalizedText text={ROLE_LABEL[user.role]} />
                  </span>
                  <span className="max-w-[120px] truncate text-sm text-paper/80">{user.name}</span>
                </div>

                <button
                  onClick={onLogout}
                  className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-paper/60 transition-colors hover:bg-white/5 hover:text-accent-rose lg:flex"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("common.signOut")}</span>
                </button>

                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-paper/70 transition-colors hover:bg-white/5 hover:text-paper lg:hidden"
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileOpen}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {user && (
        <div
          className={cn(
            "overflow-hidden border-b border-border bg-card-surface transition-[max-height] duration-300 ease-in-out lg:hidden",
            mobileOpen ? "max-h-[calc(100vh-4rem)] overflow-y-auto" : "max-h-0"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white",
                ROLE_BADGE_GRADIENT[user.role]
              )}
            >
              <LocalizedText text={ROLE_LABEL[user.role]} />
            </span>
            <span className="truncate text-sm text-paper/80">{user.name}</span>
          </div>

          <nav className="space-y-1 px-3 pb-2">
            {items.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-brand text-white" : "text-paper/70 hover:bg-white/5 hover:text-paper"
                  )}
                >
                  {item.icon}
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {user.role === "STUDENT" && (
            <div className="mx-3 mb-3 flex items-start gap-2 rounded-xl border border-border bg-surface-muted/40 p-3.5">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-amber" />
              <div>
                <p className="text-xs font-semibold text-accent-amber">{t("nav.quickTip")}</p>
                <p className="mt-1 text-xs leading-relaxed text-paper/60">{t("nav.quickTipBody")}</p>
              </div>
            </div>
          )}

          <div className="border-t border-border px-3 py-3 sm:hidden">
            <LanguageSwitcher />
          </div>

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-sm text-paper/70 transition-colors hover:bg-white/5 hover:text-accent-rose"
          >
            <LogOut className="h-4 w-4" />
            {t("common.signOut")}
          </button>
        </div>
      )}
    </header>
  );
}

function MoreMenu({
  items,
  isActive,
  hasActiveItem,
  t,
}: {
  items: NavItem[];
  isActive: (item: NavItem) => boolean;
  hasActiveItem: boolean;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
          hasActiveItem || open
            ? "bg-brand text-white shadow-sm shadow-accent-sky/25"
            : "text-paper/70 hover:bg-white/5 hover:text-paper"
        )}
        aria-expanded={open}
      >
        <span>{t("nav.more")}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-40 mt-2 w-52 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card-surface p-1.5 shadow-card">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand text-white" : "text-paper/70 hover:bg-white/5 hover:text-paper"
                )}
              >
                {item.icon}
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotificationBell() {
  const { items, unreadCount, isLoading, markAllRead } = useNotifications(10);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      markAllRead();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-paper/60 transition-colors hover:bg-white/5 hover:text-paper"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-tone-rose px-1 font-mono text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-border bg-card-surface shadow-card sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-sm font-semibold text-paper">
              <LocalizedText text="Notifications" />
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-muted" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                <LocalizedText text="No notifications yet." />
              </p>
            ) : (
              <ul>
                {items.map((item: NotificationItem) => (
                  <li key={item.id} className="border-b border-border/60 px-4 py-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", NOTIFICATION_ICON_BG[item.type])}>
                        {NOTIFICATION_ICONS[item.type]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm", item.isUnread ? "font-medium text-paper" : "text-paper/70")}>
                          <LocalizedText text={item.message} />
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-muted">{relativeTime(item.timestamp)}</p>
                      </div>
                      {item.isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-sky" />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
