// "use client";

// // components/admin/ChangeUserRoleDialog.tsx

// import { ShieldQuestion } from "lucide-react";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// import { Dialog } from "@/components/ui/Dialog";
// import { Button } from "@/components/ui/Button";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import { adminService } from "@/services/adminService";
// import type { PlatformRole, PlatformUser } from "@/types/admin";

// interface Props {
//   user: PlatformUser | null;
//   onClose: () => void;
//   onUpdated: (userId: string, role: PlatformRole) => void;
// }

// const ROLES: PlatformRole[] = ["STUDENT", "EXAMINER", "ADMIN"];

// export function ChangeUserRoleDialog({ user, onClose, onUpdated }: Props) {
//   const [role, setRole] = useState<PlatformRole>(user?.role ?? "STUDENT");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (user) setRole(user.role);
//   }, [user]);

//   if (!user) return null;

//   const unchanged = role === user.role;

//   async function handleConfirm() {
//     setIsSubmitting(true);
//     try {
//       const updated = await adminService.updateUserRole(user!.id, role);
//       onUpdated(updated.id, updated.role);
//       toast.success(`Role updated to ${updated.role.toLowerCase()}`);
//       onClose();
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <Dialog open={Boolean(user)} onClose={onClose} title="Change Role" size="sm">
//       <div className="flex gap-3">
//         <div className="shrink-0 rounded-full bg-accent-amber/15 p-2 text-accent-amber">
//           <ShieldQuestion className="h-5 w-5" />
//         </div>
//         <div className="min-w-0 flex-1">
//           <p className="text-sm text-paper">
//             Changing a role changes what {user.name} can access immediately, including on their next login.
//           </p>
//           <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">
//             {user.name} · {user.email}
//           </p>

//           <div className="mt-4 flex flex-col gap-1.5">
//             <label className="text-sm font-medium text-paper/80">New Role</label>
//             <select
//               value={role}
//               onChange={(e) => setRole(e.target.value as PlatformRole)}
//               className="h-11 w-full rounded-lg border border-border bg-surface-muted px-3.5 text-sm text-paper focus:border-accent-sky focus:outline-none"
//             >
//               {ROLES.map((r) => (
//                 <option key={r} value={r}>
//                   {r.charAt(0) + r.slice(1).toLowerCase()}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>
//       <div className="mt-6 flex justify-end gap-3">
//         <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-4">
//           Cancel
//         </Button>
//         <Button onClick={handleConfirm} isLoading={isSubmitting} disabled={unchanged} className="w-auto px-4">
//           Save Role
//         </Button>
//       </div>
//     </Dialog>
//   );
// }





"use client";

// components/admin/ChangeUserRoleDialog.tsx

import { ShieldQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import { useI18n } from "@/hooks/useI18n";
import { adminService } from "@/services/adminService";
import type { PlatformRole, PlatformUser } from "@/types/admin";

interface Props {
  user: PlatformUser | null;
  onClose: () => void;
  onUpdated: (userId: string, role: PlatformRole) => void;
}

const ROLES: PlatformRole[] = ["STUDENT", "EXAMINER", "ADMIN"];

export function ChangeUserRoleDialog({ user, onClose, onUpdated }: Props) {
  const { t } = useI18n();
  const [role, setRole] = useState<PlatformRole>(user?.role ?? "STUDENT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  if (!user) return null;

  const unchanged = role === user.role;

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      const updated = await adminService.updateUserRole(user!.id, role);
      onUpdated(updated.id, updated.role);
      toast.success(t("admin.users.changeRoleDialog.success", { role: t(`admin.users.table.role_${updated.role}`) }));
      onClose();
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={Boolean(user)} onClose={onClose} title={t("admin.users.changeRoleDialog.title")} size="sm">
      <div className="flex gap-3">
        <div className="shrink-0 rounded-full bg-accent-amber/15 p-2 text-accent-amber">
          <ShieldQuestion className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-paper">
            {t("admin.users.changeRoleDialog.description", { name: user.name })}
          </p>
          <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">
            {user.name} · {user.email}
          </p>

          <div className="mt-4 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-paper/80">{t("admin.users.changeRoleDialog.newRole")}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PlatformRole)}
              className="h-11 w-full rounded-lg border border-border bg-surface-muted px-3.5 text-sm text-paper focus:border-accent-sky focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`admin.users.table.role_${r}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-4">
          {t("admin.users.changeRoleDialog.cancel")}
        </Button>
        <Button onClick={handleConfirm} isLoading={isSubmitting} disabled={unchanged} className="w-auto px-4">
          {t("admin.users.changeRoleDialog.submit")}
        </Button>
      </div>
    </Dialog>
  );
}
