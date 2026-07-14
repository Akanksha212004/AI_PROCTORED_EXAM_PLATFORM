"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { roleToDashboardPath } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

/**
 * Client-side guard that complements the server-side `middleware.ts` check.
 * `middleware.ts` only verifies a token exists; this verifies the token's
 * role actually matches the dashboard being viewed, and redirects to the
 * correct dashboard otherwise.
 */
export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role.toUpperCase() !== allowedRole.toUpperCase()) {
      router.replace(roleToDashboardPath(user.role));
    }
  }, [isLoading, user, allowedRole, router]);

  if (isLoading || !user || user.role.toUpperCase() !== allowedRole.toUpperCase() ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-sky border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
