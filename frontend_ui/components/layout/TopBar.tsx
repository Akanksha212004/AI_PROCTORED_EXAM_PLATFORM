"use client";

import { Bell, CheckCircle2, ClipboardList, FileQuestion, LogOut, Menu, Send, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useNotifications, type NotificationItem, type NotificationType } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import type { User } from "@/types/auth";

const ROLE_LABEL: Record<User["role"], string> = {
  STUDENT: "Student",
  EXAMINER: "Examiner",
  ADMIN: "Admin",
};

const ROLE_BADGE_CLASS: Record<User["role"], string> = {
  STUDENT: "bg-accent-teal/10 text-accent-teal",
  EXAMINER: "bg-accent-sky/10 text-accent-sky",
  ADMIN: "bg-accent-rose/10 text-accent-rose",
};

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  question_added: <FileQuestion className="h-4 w-4" />,
  exam_created: <ClipboardList className="h-4 w-4" />,
  submission: <Send className="h-4 w-4" />,
  graded: <CheckCircle2 className="h-4 w-4" />,
};

const NOTIFICATION_ICON_BG: Record<NotificationType, string> = {
  question_added: "bg-accent-sky/10 text-accent-sky",
  exam_created: "bg-accent-teal/10 text-accent-teal",
  submission: "bg-accent-amber/10 text-accent-amber",
  graded: "bg-accent-violet/10 text-accent-violet",
};

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
  onMenuClick: () => void;
}

export function TopBar({ user, onLogout, onMenuClick }: Props) {
  const isExaminer = user?.role === "EXAMINER" || user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-ink/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-paper/70 transition-colors hover:bg-white/5 hover:text-paper lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo shows here on mobile only — the sidebar already carries it on desktop. */}
          <div className="flex items-center gap-2 text-paper lg:hidden">
            <ShieldCheck className="h-5 w-5 text-accent-sky" strokeWidth={2} />
            <span className="font-display text-sm font-semibold tracking-tight">ProctorEd</span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2 sm:gap-4">
            {isExaminer ? <NotificationBell /> : null}

            <div className="hidden items-center gap-2.5 sm:flex">
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${ROLE_BADGE_CLASS[user.role]}`}
              >
                {ROLE_LABEL[user.role]}
              </span>
              <span className="text-sm text-paper/80">{user.name}</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-paper/60 transition-colors hover:bg-white/5 hover:text-accent-rose"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
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
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-rose px-1 font-mono text-[10px] font-semibold leading-none text-paper">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-border bg-surface shadow-card sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-sm font-semibold text-paper">Notifications</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-muted" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>
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
                          {item.message}
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
