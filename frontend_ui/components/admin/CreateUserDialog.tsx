// "use client";

// // components/admin/CreateUserDialog.tsx

// import { useState } from "react";
// import toast from "react-hot-toast";

// import { Dialog } from "@/components/ui/Dialog";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import { adminService } from "@/services/adminService";
// import type { PlatformRole, PlatformUser } from "@/types/admin";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   onCreated: (user: PlatformUser) => void;
// }

// const ROLES: PlatformRole[] = ["STUDENT", "EXAMINER", "ADMIN"];

// const initialForm = { name: "", email: "", password: "", role: "EXAMINER" as PlatformRole };

// export function CreateUserDialog({ open, onClose, onCreated }: Props) {
//   const [form, setForm] = useState(initialForm);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   function handleClose() {
//     setForm(initialForm);
//     onClose();
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const user = await adminService.createUser(form);
//       toast.success(`${user.role === "STUDENT" ? "Student" : user.role === "EXAMINER" ? "Examiner" : "Admin"} account created`);
//       onCreated(user);
//       handleClose();
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       title="Create Account"
//       description="Add a new student, examiner, or admin account to the platform."
//       size="sm"
//     >
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Input
//           label="Full Name"
//           value={form.name}
//           onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//           required
//           minLength={2}
//         />
//         <Input
//           label="Email"
//           type="email"
//           value={form.email}
//           onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
//           required
//         />
//         <Input
//           label="Temporary Password"
//           type="password"
//           value={form.password}
//           onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
//           hint="At least 8 characters, with an uppercase letter, a number, and a symbol."
//           required
//           minLength={8}
//         />
//         <div className="flex flex-col gap-1.5">
//           <label className="text-sm font-medium text-paper/80">Role</label>
//           <select
//             value={form.role}
//             onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as PlatformRole }))}
//             className="h-11 w-full rounded-lg border border-border bg-surface-muted px-3.5 text-sm text-paper focus:border-accent-sky focus:outline-none"
//           >
//             {ROLES.map((role) => (
//               <option key={role} value={role}>
//                 {role.charAt(0) + role.slice(1).toLowerCase()}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex justify-end gap-3 pt-2">
//           <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting} className="w-auto px-4">
//             Cancel
//           </Button>
//           <Button type="submit" isLoading={isSubmitting} className="w-auto px-4">
//             Create Account
//           </Button>
//         </div>
//       </form>
//     </Dialog>
//   );
// }







"use client";

// components/admin/CreateUserDialog.tsx

import { useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import { useI18n } from "@/hooks/useI18n";
import { adminService } from "@/services/adminService";
import type { PlatformRole, PlatformUser } from "@/types/admin";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (user: PlatformUser) => void;
}

const ROLES: PlatformRole[] = ["STUDENT", "EXAMINER", "ADMIN"];

const initialForm = { name: "", email: "", password: "", role: "EXAMINER" as PlatformRole };

export function CreateUserDialog({ open, onClose, onCreated }: Props) {
  const { t } = useI18n();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose() {
    setForm(initialForm);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await adminService.createUser(form);
      const successKey =
        user.role === "STUDENT"
          ? "admin.users.createDialog.successStudent"
          : user.role === "EXAMINER"
            ? "admin.users.createDialog.successExaminer"
            : "admin.users.createDialog.successAdmin";
      toast.success(t(successKey));
      onCreated(user);
      handleClose();
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={t("admin.users.createDialog.title")}
      description={t("admin.users.createDialog.description")}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("admin.users.createDialog.fullName")}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          minLength={2}
        />
        <Input
          label={t("admin.users.createDialog.email")}
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <Input
          label={t("admin.users.createDialog.temporaryPassword")}
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          hint={t("admin.users.createDialog.passwordHint")}
          required
          minLength={8}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-paper/80">{t("admin.users.createDialog.role")}</label>
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as PlatformRole }))}
            className="h-11 w-full rounded-lg border border-border bg-surface-muted px-3.5 text-sm text-paper focus:border-accent-sky focus:outline-none"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`admin.users.table.role_${role}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting} className="w-auto px-4">
            {t("admin.users.createDialog.cancel")}
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-auto px-4">
            {t("admin.users.createDialog.submit")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
