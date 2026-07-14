"use client";

import { LogOut, ShieldCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

const ROLE_LABEL: Record<UserRole, string> = {
  STUDENT: "Student",
  EXAMINER: "Examiner",
  ADMIN: "Admin",
};

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  STUDENT: "bg-accent-teal/10 text-accent-teal",
  EXAMINER: "bg-accent-sky/10 text-accent-sky",
  ADMIN: "bg-accent-rose/10 text-accent-rose",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-paper">
            <ShieldCheck className="h-5 w-5 text-accent-sky" strokeWidth={2} />
            <span className="font-display text-base font-semibold tracking-tight">ProctorEd</span>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span
                className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${ROLE_BADGE_CLASS[user.role]}`}
              >
                {ROLE_LABEL[user.role]}
              </span>
              <span className="hidden text-sm text-paper/70 sm:inline">{user.name}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-paper/60 transition-colors hover:text-accent-rose"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
