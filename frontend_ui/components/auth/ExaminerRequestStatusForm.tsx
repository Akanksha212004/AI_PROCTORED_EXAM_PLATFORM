"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { extractErrorMessage } from "@/lib/utils";
import { authService } from "@/services/authService";
import type { ApprovalStatus, ExaminerRequestStatusResponse } from "@/types/auth";

const STATUS_TONE: Record<ApprovalStatus, "amber" | "teal" | "rose"> = {
  PENDING: "amber",
  APPROVED: "teal",
  REJECTED: "rose",
};

interface LookupErrors {
  lookup?: string;
}

interface ResubmitFormState {
  name: string;
  institution: string;
  department: string;
  designation: string;
  employeeId: string;
  yearsOfExperience: string;
  accessRequestReason: string;
}

interface ResubmitErrors {
  name?: string;
  institution?: string;
  department?: string;
  designation?: string;
  yearsOfExperience?: string;
  accessRequestReason?: string;
}

function toResubmitForm(request: ExaminerRequestStatusResponse): ResubmitFormState {
  return {
    name: request.name,
    institution: request.institution,
    department: request.department,
    designation: request.designation,
    employeeId: request.employeeId ?? "",
    yearsOfExperience: request.yearsOfExperience?.toString() ?? "",
    accessRequestReason: request.accessRequestReason,
  };
}

export function ExaminerRequestStatusForm() {
  const [lookupBy, setLookupBy] = useState<"requestId" | "email">("email");
  const [lookupValue, setLookupValue] = useState("");
  const [lookupErrors, setLookupErrors] = useState<LookupErrors>({});
  const [isLookingUp, setIsLookingUp] = useState(false);

  const [request, setRequest] = useState<ExaminerRequestStatusResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resubmitForm, setResubmitForm] = useState<ResubmitFormState | null>(null);
  const [resubmitErrors, setResubmitErrors] = useState<ResubmitErrors>({});
  const [isResubmitting, setIsResubmitting] = useState(false);

  function updateResubmit<K extends keyof ResubmitFormState>(key: K, value: ResubmitFormState[K]) {
    setResubmitForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleLookup(event: FormEvent) {
    event.preventDefault();

    const trimmed = lookupValue.trim();
    if (!trimmed) {
      setLookupErrors({ lookup: `Enter your ${lookupBy === "email" ? "official email" : "request ID"}` });
      return;
    }
    setLookupErrors({});
    setIsLookingUp(true);
    setIsEditing(false);

    try {
      const query = lookupBy === "email" ? { email: trimmed.toLowerCase() } : { requestId: trimmed };
      const result = await authService.getExaminerRequestStatus(query);
      setRequest(result);
      setResubmitForm(toResubmitForm(result));
    } catch (error) {
      setRequest(null);
      setResubmitForm(null);
      toast.error(extractErrorMessage(error) || "No request found for those details.");
    } finally {
      setIsLookingUp(false);
    }
  }

  function validateResubmit(form: ResubmitFormState): boolean {
    const nextErrors: ResubmitErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Full name must be at least 2 characters";
    if (form.institution.trim().length < 2) nextErrors.institution = "Institution is required";
    if (form.department.trim().length < 2) nextErrors.department = "Department is required";
    if (form.designation.trim().length < 2) nextErrors.designation = "Designation is required";
    if (form.yearsOfExperience && Number(form.yearsOfExperience) < 0) {
      nextErrors.yearsOfExperience = "Enter a valid number of years";
    }
    if (form.accessRequestReason.trim().length < 10) {
      nextErrors.accessRequestReason = "Please provide a short reason (at least 10 characters)";
    }
    setResubmitErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleResubmit(event: FormEvent) {
    event.preventDefault();
    if (!request || !resubmitForm) return;
    if (!validateResubmit(resubmitForm)) return;

    setIsResubmitting(true);
    try {
      const updated = await authService.resubmitExaminerAccessRequest(request.requestId, {
        name: resubmitForm.name.trim(),
        institution: resubmitForm.institution.trim(),
        department: resubmitForm.department.trim(),
        designation: resubmitForm.designation.trim(),
        employeeId: resubmitForm.employeeId.trim() || undefined,
        yearsOfExperience: resubmitForm.yearsOfExperience ? Number(resubmitForm.yearsOfExperience) : undefined,
        accessRequestReason: resubmitForm.accessRequestReason.trim(),
      });
      setRequest(updated);
      setResubmitForm(toResubmitForm(updated));
      setIsEditing(false);
      toast.success("Request resubmitted — it's back in the review queue.");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsResubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleLookup} noValidate className="flex flex-col gap-5">
        <div className="flex gap-2 rounded-lg border border-border bg-surface-muted p-1">
          {(["email", "requestId"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setLookupBy(option);
                setLookupValue("");
                setLookupErrors({});
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                lookupBy === option ? "bg-accent-sky/15 text-accent-sky" : "text-paper/60 hover:text-paper/80"
              }`}
            >
              {option === "email" ? "Official Email" : "Request ID"}
            </button>
          ))}
        </div>

        <Input
          label={lookupBy === "email" ? "Official email" : "Request ID"}
          type={lookupBy === "email" ? "email" : "text"}
          placeholder={lookupBy === "email" ? "you@institution.edu" : "e.g. 6f1c2e9a-..."}
          value={lookupValue}
          onChange={(e) => setLookupValue(e.target.value)}
          error={lookupErrors.lookup}
        />

        <Button type="submit" isLoading={isLookingUp}>
          {isLookingUp ? "Checking status" : "Check Status"}
        </Button>
      </form>

      {request && (
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Application status</p>
              <p className="font-display text-lg font-semibold text-paper">{request.name}</p>
            </div>
            <Badge tone={STATUS_TONE[request.status]}>{request.status}</Badge>
          </div>

          {request.status === "PENDING" && (
            <p className="text-sm text-paper/70">Your application is currently under administrator review.</p>
          )}

          {request.status === "APPROVED" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-paper/70">
                Your request has been approved. You may now login through the Examiner Portal.
              </p>
              <Link href="/examiner-portal">
                <Button type="button">Go to Examiner Login</Button>
              </Link>
            </div>
          )}

          {request.status === "REJECTED" && !isEditing && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-accent-rose/30 bg-accent-rose/10 p-3.5">
                <p className="text-xs font-medium uppercase tracking-wide text-accent-rose/80">Rejection reason</p>
                <p className="mt-1 text-sm text-paper/80">
                  {request.rejectionReason || "No reason was provided."}
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setIsEditing(true)}>
                Edit &amp; Resubmit Request
              </Button>
            </div>
          )}

          {request.status === "REJECTED" && isEditing && resubmitForm && (
            <form onSubmit={handleResubmit} noValidate className="flex flex-col gap-5 border-t border-border pt-5">
              <Input
                label="Full name"
                value={resubmitForm.name}
                onChange={(e) => updateResubmit("name", e.target.value)}
                error={resubmitErrors.name}
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Institution"
                  value={resubmitForm.institution}
                  onChange={(e) => updateResubmit("institution", e.target.value)}
                  error={resubmitErrors.institution}
                />
                <Input
                  label="Department"
                  value={resubmitForm.department}
                  onChange={(e) => updateResubmit("department", e.target.value)}
                  error={resubmitErrors.department}
                />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Designation"
                  value={resubmitForm.designation}
                  onChange={(e) => updateResubmit("designation", e.target.value)}
                  error={resubmitErrors.designation}
                />
                <Input
                  label="Employee ID (optional)"
                  value={resubmitForm.employeeId}
                  onChange={(e) => updateResubmit("employeeId", e.target.value)}
                />
              </div>
              <Input
                label="Years of experience (optional)"
                type="number"
                min={0}
                value={resubmitForm.yearsOfExperience}
                onChange={(e) => updateResubmit("yearsOfExperience", e.target.value)}
                error={resubmitErrors.yearsOfExperience}
              />
              <Textarea
                label="Reason for requesting access"
                value={resubmitForm.accessRequestReason}
                onChange={(e) => updateResubmit("accessRequestReason", e.target.value)}
                error={resubmitErrors.accessRequestReason}
              />

              <div className="flex gap-3">
                <Button type="submit" isLoading={isResubmitting} className="flex-1">
                  {isResubmitting ? "Resubmitting" : "Resubmit Request"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      <p className="text-center text-sm text-paper/60">
        <Link href="/examiner-portal" className="font-medium text-accent-sky underline underline-offset-4">
          Back to Examiner Login
        </Link>
      </p>
    </div>
  );
}
