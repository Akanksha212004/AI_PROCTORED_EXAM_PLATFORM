
"use client";

// components/admin/UserTable.tsx

import { ShieldAlert, Users as UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/hooks/useI18n";
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

function relativeTime(iso: string, t: (key: string, params?: Record<string, string | number>) => string, language: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t("common.justNow");
  if (minutes < 60) return t("common.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("common.hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("common.daysAgo", { count: days });
  return new Date(iso).toLocaleDateString(language);
}

export function UserTable({ users, isLoading, currentUserId, onToggleStatus, onChangeRole }: Props) {
  const { t, language } = useI18n();

  function activityLabel(user: PlatformUser): string {
    if (user.role === "STUDENT") {
      return user.activityCount === 1
        ? t("admin.users.table.activityTakenExam", { count: user.activityCount })
        : t("admin.users.table.activityTakenExams", { count: user.activityCount });
    }
    return user.activityCount === 1
      ? t("admin.users.table.activityCreatedExam", { count: user.activityCount })
      : t("admin.users.table.activityCreatedExams", { count: user.activityCount });
  }

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
        <p className="text-sm text-muted">{t("admin.users.table.empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-5 py-3 font-medium">{t("admin.users.table.user")}</th>
            <th className="px-5 py-3 font-medium">{t("admin.users.table.role")}</th>
            <th className="px-5 py-3 font-medium">{t("admin.users.table.activity")}</th>
            <th className="px-5 py-3 font-medium">{t("admin.users.table.joined")}</th>
            <th className="px-5 py-3 font-medium">{t("admin.users.table.status")}</th>
            <th className="px-5 py-3 font-medium text-right">{t("admin.users.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                <td className="max-w-[220px] px-5 py-3.5">
                  <p className="truncate font-medium text-paper">
                    {user.name}
                    {isSelf && <span className="ml-1.5 text-xs text-muted">{t("admin.users.table.you")}</span>}
                  </p>
                  <p className="truncate text-xs text-muted" title={user.email}>{user.email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={ROLE_TONE[user.role]}>{t(`admin.users.table.role_${user.role}`)}</Badge>
                </td>
                <td className="px-5 py-3.5 text-paper/80">{activityLabel(user)}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-muted">
                  {relativeTime(user.createdAt, t, language)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      user.isActive ? "bg-accent-teal/10 text-accent-teal" : "bg-paper/5 text-paper/40"
                    )}
                  >
                    {user.isActive ? t("admin.users.table.active") : t("admin.users.table.inactive")}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onChangeRole(user)}
                      disabled={isSelf}
                      title={isSelf ? t("admin.users.table.changeRoleDisabledHint") : t("admin.users.table.changeRoleHint")}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-paper/70 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t("admin.users.table.changeRole")}
                    </button>
                    <button
                      onClick={() => onToggleStatus(user)}
                      disabled={isSelf}
                      title={isSelf ? t("admin.users.table.deactivateDisabledHint") : undefined}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        user.isActive
                          ? "border-accent-rose/30 text-accent-rose hover:bg-accent-rose/10"
                          : "border-accent-teal/30 text-accent-teal hover:bg-accent-teal/10"
                      )}
                    >
                      {user.isActive ? t("admin.users.table.deactivate") : t("admin.users.table.activate")}
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
          {t("admin.users.table.selfProtectionNote")}
        </p>
      )}
    </div>
  );
}
