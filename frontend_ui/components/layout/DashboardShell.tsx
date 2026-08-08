"use client";

import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink">
      <Header user={user} onLogout={logout} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
