"use client";

// components/admin/ExaminerRequestTable.tsx

import { GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { ExaminerApprovalStatus, ExaminerRequest } from "@/types/admin";

interface Props {
  requests: ExaminerRequest[];
  isLoading: boolean;
  onApprove: (request: ExaminerRequest) => void;
  onReject: (request: ExaminerRequest) => void;
}

const STATUS_TONE: Record<ExaminerApprovalStatus, "amber" | "teal" | "rose"> = {
  PENDING: "amber",
  APPROVED: "teal",
  REJECTED: "rose",
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

export function ExaminerRequestTable({ requests, isLoading, onApprove, onReject }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-paper/30">
          <GraduationCap className="h-6 w-6" />
        </span>
        <p className="text-sm text-muted">No examiner requests here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <th className="px-5 py-3 font-medium">Applicant</th>
            <th className="px-5 py-3 font-medium">Institution / Department</th>
            <th className="px-5 py-3 font-medium">Designation</th>
            <th className="px-5 py-3 font-medium">Requested</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
              <td className="px-5 py-3.5">
                <p className="font-medium text-paper">{request.name}</p>
                <p className="text-xs text-muted">{request.email}</p>
                {request.employeeId && (
                  <p className="text-xs text-paper/40">ID: {request.employeeId}</p>
                )}
              </td>
              <td className="px-5 py-3.5 text-paper/80">
                <p>{request.institution ?? "—"}</p>
                <p className="text-xs text-muted">{request.department ?? "—"}</p>
              </td>
              <td className="px-5 py-3.5 text-paper/80">
                <p>{request.designation ?? "—"}</p>
                {request.yearsOfExperience !== null && (
                  <p className="text-xs text-muted">{request.yearsOfExperience} yrs experience</p>
                )}
              </td>
              <td className="px-5 py-3.5 font-mono text-xs text-muted">{relativeTime(request.createdAt)}</td>
              <td className="px-5 py-3.5">
                <Badge tone={STATUS_TONE[request.approvalStatus]}>{request.approvalStatus}</Badge>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onReject(request)}
                    disabled={request.approvalStatus !== "PENDING"}
                    className="rounded-lg border border-accent-rose/30 px-3 py-1.5 text-xs font-medium text-accent-rose transition-colors hover:bg-accent-rose/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(request)}
                    disabled={request.approvalStatus !== "PENDING"}
                    className="rounded-lg border border-accent-teal/30 px-3 py-1.5 text-xs font-medium text-accent-teal transition-colors hover:bg-accent-teal/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Approve
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
