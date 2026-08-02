// "use client";

// // components/admin/ExaminerRequestActionDialog.tsx

// import { AlertTriangle, ShieldCheck } from "lucide-react";
// import { useState } from "react";
// import toast from "react-hot-toast";

// import { Dialog } from "@/components/ui/Dialog";
// import { Button } from "@/components/ui/Button";
// import { Textarea } from "@/components/ui/Textarea";
// import { extractExamErrorMessage } from "@/components/exams/examErrors";
// import { adminService } from "@/services/adminService";
// import type { ExaminerRequest } from "@/types/admin";

// interface Props {
//   request: ExaminerRequest | null;
//   action: "approve" | "reject" | null;
//   onClose: () => void;
//   onResolved: (updated: ExaminerRequest) => void;
// }

// export function ExaminerRequestActionDialog({ request, action, onClose, onResolved }: Props) {
//   const [reason, setReason] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   if (!request || !action) return null;

//   const isApprove = action === "approve";

//   async function handleConfirm() {
//     setIsSubmitting(true);
//     try {
//       const updated = isApprove
//         ? await adminService.approveExaminerRequest(request!.id)
//         : await adminService.rejectExaminerRequest(request!.id, reason.trim() || undefined);
//       onResolved(updated);
//       toast.success(isApprove ? "Examiner approved" : "Examiner request rejected");
//       setReason("");
//       onClose();
//     } catch (err) {
//       toast.error(extractExamErrorMessage(err));
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <Dialog
//       open={Boolean(request && action)}
//       onClose={onClose}
//       title={isApprove ? "Approve Examiner Request" : "Reject Examiner Request"}
//       size="sm"
//     >
//       <div className="flex gap-3">
//         <div
//           className={`shrink-0 rounded-full p-2 ${
//             isApprove ? "bg-accent-teal/15 text-accent-teal" : "bg-accent-rose/15 text-accent-rose"
//           }`}
//         >
//           {isApprove ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
//         </div>
//         <div className="flex-1">
//           <p className="text-sm text-paper">
//             {isApprove
//               ? "This will activate the examiner account — they'll be able to sign in through the Examiner Portal right away."
//               : "This will block the applicant from logging in and mark their request as rejected."}
//           </p>
//           <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">
//             {request.name} · {request.email}
//             {request.institution ? ` · ${request.institution}` : ""}
//           </p>

//           {!isApprove && (
//             <div className="mt-4">
//               <Textarea
//                 label="Reason (optional)"
//                 placeholder="Let the applicant know why this request was rejected…"
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//                 rows={3}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="mt-6 flex justify-end gap-3">
//         <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-4">
//           Cancel
//         </Button>
//         <Button
//           onClick={handleConfirm}
//           isLoading={isSubmitting}
//           className={`w-auto px-4 ${isApprove ? "bg-accent-teal hover:bg-accent-teal/90" : "bg-accent-rose hover:bg-accent-rose/90"}`}
//         >
//           {isApprove ? "Approve" : "Reject"}
//         </Button>
//       </div>
//     </Dialog>
//   );
// }







"use client";

// components/admin/ExaminerRequestActionDialog.tsx

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import { useI18n } from "@/hooks/useI18n";
import { adminService } from "@/services/adminService";
import type { ExaminerRequest } from "@/types/admin";

interface Props {
  request: ExaminerRequest | null;
  action: "approve" | "reject" | null;
  onClose: () => void;
  onResolved: (updated: ExaminerRequest) => void;
}

export function ExaminerRequestActionDialog({ request, action, onClose, onResolved }: Props) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request || !action) return null;

  const isApprove = action === "approve";

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      const updated = isApprove
        ? await adminService.approveExaminerRequest(request!.id)
        : await adminService.rejectExaminerRequest(request!.id, reason.trim() || undefined);
      onResolved(updated);
      toast.success(
        isApprove
          ? t("admin.examinerRequests.actionDialog.successApproved")
          : t("admin.examinerRequests.actionDialog.successRejected")
      );
      setReason("");
      onClose();
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={Boolean(request && action)}
      onClose={onClose}
      title={isApprove ? t("admin.examinerRequests.actionDialog.approveTitle") : t("admin.examinerRequests.actionDialog.rejectTitle")}
      size="sm"
    >
      <div className="flex gap-3">
        <div
          className={`shrink-0 rounded-full p-2 ${
            isApprove ? "bg-accent-teal/15 text-accent-teal" : "bg-accent-rose/15 text-accent-rose"
          }`}
        >
          {isApprove ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className="text-sm text-paper">
            {isApprove
              ? t("admin.examinerRequests.actionDialog.approveDescription")
              : t("admin.examinerRequests.actionDialog.rejectDescription")}
          </p>
          <p className="mt-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted">
            {request.name} · {request.email}
            {request.institution ? ` · ${request.institution}` : ""}
          </p>

          {!isApprove && (
            <div className="mt-4">
              <Textarea
                label={t("admin.examinerRequests.actionDialog.reasonLabel")}
                placeholder={t("admin.examinerRequests.actionDialog.reasonPlaceholder")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-4">
          {t("admin.examinerRequests.actionDialog.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={isSubmitting}
          className={`w-auto px-4 ${isApprove ? "bg-accent-teal hover:bg-accent-teal/90" : "bg-accent-rose hover:bg-accent-rose/90"}`}
        >
          {isApprove ? t("admin.examinerRequests.actionDialog.approve") : t("admin.examinerRequests.actionDialog.reject")}
        </Button>
      </div>
    </Dialog>
  );
}
