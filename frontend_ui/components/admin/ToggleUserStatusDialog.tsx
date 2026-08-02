// "use client";

// // components/admin/ToggleUserStatusDialog.tsx

// import { AlertTriangle, ShieldCheck } from "lucide-react";
// import { useState } from "react";
// import toast from "react-hot-toast";

// import { Dialog } from "@/components/ui/Dialog";
// import { Button } from "@/components/ui/Button";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import { adminService } from "@/services/adminService";
// import type { PlatformUser } from "@/types/admin";

// interface Props {
//   user: PlatformUser | null;
//   onClose: () => void;
//   onUpdated: (userId: string, isActive: boolean) => void;
// }

// export function ToggleUserStatusDialog({ user, onClose, onUpdated }: Props) {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   if (!user) return null;

//   const nextIsActive = !user.isActive;

//   async function handleConfirm() {
//     setIsSubmitting(true);
//     try {
//       const updated = await adminService.updateUserStatus(user!.id, nextIsActive);
//       onUpdated(updated.id, updated.isActive);
//       toast.success(nextIsActive ? "Account activated" : "Account deactivated");
//       onClose();
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <Dialog open={Boolean(user)} onClose={onClose} title={nextIsActive ? "Activate Account" : "Deactivate Account"} size="sm">
//       <div className="flex gap-3">
//         <div
//           className={`shrink-0 rounded-full p-2 ${
//             nextIsActive ? "bg-accent-teal/15 text-accent-teal" : "bg-accent-rose/15 text-accent-rose"
//           }`}
//         >
//           {nextIsActive ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
//         </div>
//         <div>
//           <p className="text-sm text-paper">
//             {nextIsActive
//               ? "This will re-enable the account so they can log in again."
//               : "This will immediately block this account from logging in. Any exam session already in progress won't be interrupted."}
//           </p>
//           <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">
//             {user.name} · {user.email} · {user.role}
//           </p>
//         </div>
//       </div>
//       <div className="mt-6 flex justify-end gap-3">
//         <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-4">
//           Cancel
//         </Button>
//         <Button
//           onClick={handleConfirm}
//           isLoading={isSubmitting}
//           className={`w-auto px-4 ${nextIsActive ? "bg-accent-teal hover:bg-accent-teal/90" : "bg-accent-rose hover:bg-accent-rose/90"}`}
//         >
//           {nextIsActive ? "Activate" : "Deactivate"}
//         </Button>
//       </div>
//     </Dialog>
//   );
// }







"use client";

// components/admin/ToggleUserStatusDialog.tsx

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import { useI18n } from "@/hooks/useI18n";
import { adminService } from "@/services/adminService";
import type { PlatformUser } from "@/types/admin";

interface Props {
  user: PlatformUser | null;
  onClose: () => void;
  onUpdated: (userId: string, isActive: boolean) => void;
}

export function ToggleUserStatusDialog({ user, onClose, onUpdated }: Props) {
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!user) return null;

  const nextIsActive = !user.isActive;

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      const updated = await adminService.updateUserStatus(user!.id, nextIsActive);
      onUpdated(updated.id, updated.isActive);
      toast.success(
        nextIsActive
          ? t("admin.users.toggleStatusDialog.successActivated")
          : t("admin.users.toggleStatusDialog.successDeactivated")
      );
      onClose();
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={Boolean(user)}
      onClose={onClose}
      title={nextIsActive ? t("admin.users.toggleStatusDialog.activateTitle") : t("admin.users.toggleStatusDialog.deactivateTitle")}
      size="sm"
    >
      <div className="flex gap-3">
        <div
          className={`shrink-0 rounded-full p-2 ${
            nextIsActive ? "bg-accent-teal/15 text-accent-teal" : "bg-accent-rose/15 text-accent-rose"
          }`}
        >
          {nextIsActive ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-sm text-paper">
            {nextIsActive
              ? t("admin.users.toggleStatusDialog.activateDescription")
              : t("admin.users.toggleStatusDialog.deactivateDescription")}
          </p>
          <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">
            {user.name} · {user.email} · {t(`admin.users.table.role_${user.role}`)}
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-4">
          {t("admin.users.toggleStatusDialog.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={isSubmitting}
          className={`w-auto px-4 ${nextIsActive ? "bg-accent-teal hover:bg-accent-teal/90" : "bg-accent-rose hover:bg-accent-rose/90"}`}
        >
          {nextIsActive ? t("admin.users.toggleStatusDialog.activate") : t("admin.users.toggleStatusDialog.deactivate")}
        </Button>
      </div>
    </Dialog>
  );
}
