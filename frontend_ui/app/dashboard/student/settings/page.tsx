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
import { useI18n } from "@/hooks/useI18n";

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
  const { t } = useI18n();

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
      toast.error(t("studentSettings.passwordMismatch"));
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
        <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
          {t("studentSettings.title")}
        </h1>
        <p className="mt-1.5 text-sm text-paper/60">{t("studentSettings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
              <UserIcon className="h-4 w-4 text-accent-sky" />
              {t("studentSettings.profileSection.heading")}
            </p>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                {t("studentSettings.profileSection.nameLabel")}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                {t("studentSettings.profileSection.emailLabel")}
              </label>
              <input value={user?.email ?? ""} disabled className={inputClass} />
              <p className="mt-1 text-xs text-muted">{t("studentSettings.profileSection.emailHint")}</p>
            </div>

            <Button type="submit" className="w-auto px-4" disabled={isSavingProfile || name.trim().length < 2}>
              {isSavingProfile ? t("studentSettings.profileSection.saving") : t("studentSettings.profileSection.save")}
            </Button>
          </form>
        </Card>

        <Card>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <p className="flex items-center gap-2 font-display text-base font-semibold text-paper">
              <KeyRound className="h-4 w-4 text-accent-violet" />
              {t("studentSettings.passwordSection.heading")}
            </p>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                {t("studentSettings.passwordSection.currentPasswordLabel")}
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
                {t("studentSettings.passwordSection.newPasswordLabel")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-muted">{t("studentSettings.passwordSection.newPasswordHint")}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                {t("studentSettings.passwordSection.confirmPasswordLabel")}
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
              {isSavingPassword ? t("studentSettings.passwordSection.updating") : t("studentSettings.passwordSection.update")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
