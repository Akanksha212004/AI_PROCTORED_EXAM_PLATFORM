"use client";

import { KeyRound, User as UserIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export default function StudentSettingsPage() {
  return (
    <RoleGuard allowedRole="STUDENT">
      <DashboardShell>
        <SettingsContent />
      </DashboardShell>
    </RoleGuard>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-paper placeholder:text-paper/40 focus:border-accent-sky focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

function SettingsContent() {
  const { user } = useAuth();
  const { updateProfile, changePassword, isSavingProfile, isSavingPassword } = useSettings();

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile(name);
    } catch {
      // toast already shown by the hook
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation don't match");
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // toast already shown by the hook
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">Settings</h1>
        <p className="mt-1.5 text-sm text-paper/60">Manage your account profile and password.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
              <UserIcon className="h-4 w-4 text-accent-sky" />
              Profile
            </p>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Email</label>
              <input value={user?.email ?? ""} disabled className={inputClass} />
              <p className="mt-1 text-xs text-muted">Email can&apos;t be changed here.</p>
            </div>

            <Button type="submit" className="w-auto px-4" disabled={isSavingProfile || name.trim().length < 2}>
              {isSavingProfile ? "Saving…" : "Save Profile"}
            </Button>
          </form>
        </Card>

        <Card>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
              <KeyRound className="h-4 w-4 text-accent-violet" />
              Change Password
            </p>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-muted">
                At least 8 characters, with an uppercase letter, lowercase letter, digit, and special character.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-auto px-4"
              disabled={isSavingPassword || !currentPassword || !newPassword}
            >
              {isSavingPassword ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
