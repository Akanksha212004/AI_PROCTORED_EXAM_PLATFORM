"use client";

// components/admin/UserTable.tsx

import { ShieldAlert, Users as UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { PlatformUser } from "@/types/admin";

type BadgeTone = "sky" | "teal" | "rose" | "neutral" | "amber";

interface Props {
  users: PlatformUser[];
  isLoading: boolean;
  currentUserId?: string;
  onToggleStatus: (user: PlatformUser) => void;
  onChangeRole: (user: PlatformUser) => void;
}

const ROLE_TONE: Record<PlatformUser["role"], BadgeTone> = {
  STUDENT: "sky",
  EXAMINER: "teal",
  ADMIN: "amber",
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

function activityLabel(user: PlatformUser): string {
  if (user.role === "STUDENT") return `${user.activityCount} exam${user.activityCount === 1 ? "" : "s"} taken`;
  return `${user.activityCount} exam${user.activityCount === 1 ? "" : "s"} created`;
}

export function UserTable({ users, isLoading, currentUserId, onToggleStatus, onChangeRole }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-paper/30">
          <UsersIcon className="h-6 w-6" />
        </span>
        <p className="text-sm text-muted">No accounts match these filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-5 py-3 font-medium">User</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">Activity</th>
            <th className="px-5 py-3 font-medium">Joined</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-paper">
                    {user.name}
                    {isSelf && <span className="ml-1.5 text-xs text-muted">(you)</span>}
                  </p>
                  <p className="text-xs text-muted">{user.email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={ROLE_TONE[user.role]}>{user.role}</Badge>
                </td>
                <td className="px-5 py-3.5 text-paper/80">{activityLabel(user)}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-muted">{relativeTime(user.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      user.isActive ? "bg-accent-teal/10 text-accent-teal" : "bg-paper/5 text-paper/40"
                    )}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onChangeRole(user)}
                      disabled={isSelf}
                      title={isSelf ? "You can't change your own role" : "Change role"}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Change Role
                    </button>
                    <button
                      onClick={() => onToggleStatus(user)}
                      disabled={isSelf}
                      title={isSelf ? "You can't deactivate your own account" : undefined}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        user.isActive
                          ? "border-accent-rose/30 text-accent-rose hover:bg-accent-rose/10"
                          : "border-accent-teal/30 text-accent-teal hover:bg-accent-teal/10"
                      )}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {users.some((u) => u.role === "ADMIN") && (
        <p className="flex items-center gap-1.5 border-t border-border px-5 py-3 text-xs text-muted">
          <ShieldAlert className="h-3.5 w-3.5" />
          You can&apos;t change your own role or deactivate your own account, to avoid locking every admin out.
        </p>
      )}
    </div>
  );
}
