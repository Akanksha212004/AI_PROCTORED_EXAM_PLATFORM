// "use client";

// // app/dashboard/admin/examiner-requests/page.tsx

// import { useMemo, useState } from "react";

// import { RoleGuard } from "@/components/auth/RoleGuard";
// import { DashboardShell } from "@/components/layout/DashboardShell";
// import { Card, Select } from "@/components/ui/Card";
// import { Pagination } from "@/components/ui/Pagination";
// import { useExaminerRequests } from "@/hooks/useExaminerRequests";
// import { ExaminerRequestTable } from "@/components/admin/ExaminerRequestTable";
// import { ExaminerRequestActionDialog } from "@/components/admin/ExaminerRequestActionDialog";
// import type { ExaminerApprovalStatus, ExaminerRequest } from "@/types/admin";

// const PAGE_SIZE = 10;

// export default function AdminExaminerRequestsPage() {
//   return (
//     <RoleGuard allowedRole="ADMIN">
//       <DashboardShell>
//         <ExaminerRequestsContent />
//       </DashboardShell>
//     </RoleGuard>
//   );
// }

// function ExaminerRequestsContent() {
//   const [status, setStatus] = useState<ExaminerApprovalStatus>("PENDING");
//   const [page, setPage] = useState(1);

//   const listParams = useMemo(() => ({ status, page, limit: PAGE_SIZE }), [status, page]);
//   const { items, pagination, isLoading, refetch } = useExaminerRequests(listParams);

//   const [overrides, setOverrides] = useState<Record<string, Partial<ExaminerRequest>>>({});
//   const [target, setTarget] = useState<{ request: ExaminerRequest; action: "approve" | "reject" } | null>(null);

//   const resolvedItems = items.map((r) => ({ ...r, ...overrides[r.id] }));

//   function handleStatusChange(next: ExaminerApprovalStatus) {
//     setStatus(next);
//     setPage(1);
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="font-display text-2xl font-semibold text-paper">Pending Examiner Requests</h1>
//         <p className="text-sm text-muted">
//           Review faculty/examiner access requests. Approved accounts can sign in through the Examiner Portal immediately.
//         </p>
//       </div>

//       <Card className="p-5">
//         <div className="max-w-xs">
//           <Select
//             label="Status"
//             value={status}
//             onChange={(e) => handleStatusChange(e.target.value as ExaminerApprovalStatus)}
//           >
//             <option value="PENDING">Pending</option>
//             <option value="APPROVED">Approved</option>
//             <option value="REJECTED">Rejected</option>
//           </Select>
//         </div>
//       </Card>

//       <Card className="overflow-hidden p-0">
//         <ExaminerRequestTable
//           requests={resolvedItems}
//           isLoading={isLoading}
//           onApprove={(request) => setTarget({ request, action: "approve" })}
//           onReject={(request) => setTarget({ request, action: "reject" })}
//         />
//         <Pagination pagination={pagination} onPageChange={setPage} itemLabel="requests" />
//       </Card>

//       <ExaminerRequestActionDialog
//         request={target?.request ?? null}
//         action={target?.action ?? null}
//         onClose={() => setTarget(null)}
//         onResolved={(updated) => {
//           setOverrides((prev) => ({
//             ...prev,
//             [updated.id]: { approvalStatus: updated.approvalStatus, rejectionReason: updated.rejectionReason },
//           }));
//           refetch();
//         }}
//       />
//     </div>
//   );
// }





"use client";

// app/dashboard/admin/examiner-requests/page.tsx

import { useMemo, useState } from "react";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, Select } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { useI18n } from "@/hooks/useI18n";
import { useExaminerRequests } from "@/hooks/useExaminerRequests";
import { ExaminerRequestTable } from "@/components/admin/ExaminerRequestTable";
import { ExaminerRequestActionDialog } from "@/components/admin/ExaminerRequestActionDialog";
import type { ExaminerApprovalStatus, ExaminerRequest } from "@/types/admin";

const PAGE_SIZE = 10;

export default function AdminExaminerRequestsPage() {
  return (
    <RoleGuard allowedRole="ADMIN">
      <DashboardShell>
        <ExaminerRequestsContent />
      </DashboardShell>
    </RoleGuard>
  );
}

function ExaminerRequestsContent() {
  const { t } = useI18n();
  const [status, setStatus] = useState<ExaminerApprovalStatus>("PENDING");
  const [page, setPage] = useState(1);

  const listParams = useMemo(() => ({ status, page, limit: PAGE_SIZE }), [status, page]);
  const { items, pagination, isLoading, refetch } = useExaminerRequests(listParams);

  const [overrides, setOverrides] = useState<Record<string, Partial<ExaminerRequest>>>({});
  const [target, setTarget] = useState<{ request: ExaminerRequest; action: "approve" | "reject" } | null>(null);

  const resolvedItems = items.map((r) => ({ ...r, ...overrides[r.id] }));

  function handleStatusChange(next: ExaminerApprovalStatus) {
    setStatus(next);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper">{t("admin.examinerRequests.title")}</h1>
        <p className="text-sm text-muted">{t("admin.examinerRequests.subtitle")}</p>
      </div>

      <Card className="p-5">
        <div className="max-w-xs">
          <Select
            label={t("admin.examinerRequests.statusLabel")}
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ExaminerApprovalStatus)}
          >
            <option value="PENDING">{t("admin.examinerRequests.statusPending")}</option>
            <option value="APPROVED">{t("admin.examinerRequests.statusApproved")}</option>
            <option value="REJECTED">{t("admin.examinerRequests.statusRejected")}</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <ExaminerRequestTable
          requests={resolvedItems}
          isLoading={isLoading}
          onApprove={(request) => setTarget({ request, action: "approve" })}
          onReject={(request) => setTarget({ request, action: "reject" })}
        />
        <Pagination pagination={pagination} onPageChange={setPage} itemLabelKey="common.itemLabels.requests" />
      </Card>

      <ExaminerRequestActionDialog
        request={target?.request ?? null}
        action={target?.action ?? null}
        onClose={() => setTarget(null)}
        onResolved={(updated) => {
          setOverrides((prev) => ({
            ...prev,
            [updated.id]: { approvalStatus: updated.approvalStatus, rejectionReason: updated.rejectionReason },
          }));
          refetch();
        }}
      />
    </div>
  );
}
