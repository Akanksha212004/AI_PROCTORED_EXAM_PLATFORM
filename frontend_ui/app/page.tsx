"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";
import { roleToDashboardPath } from "@/lib/utils";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? roleToDashboardPath(user.role) : "/login");
  }, [isLoading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-sky border-t-transparent" />
    </div>
  );
}
