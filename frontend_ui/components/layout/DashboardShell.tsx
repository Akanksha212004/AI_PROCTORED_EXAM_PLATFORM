"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/hooks/useAuth";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink overflow-x-hidden">
      {user && (
        <Sidebar role={user.role} isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      )}

      <div className="lg:pl-64">
        <TopBar user={user} onLogout={logout} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
