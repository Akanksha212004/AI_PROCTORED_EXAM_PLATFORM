// src/schemas/examinerAccess.schema.ts
//
// Validation for the public "Request Examiner Access" form. Submitting
// this creates a User with role EXAMINER and approvalStatus PENDING —
// it does NOT log the applicant in or issue a token (see
// authService.requestExaminerAccess).

import { z } from "zod";

import { passwordSchema } from "./user.schema";

export const requestExaminerAccessSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(150),
  email: z.string().email("Enter a valid official email address").toLowerCase(),
  password: passwordSchema,
  institution: z.string().min(2, "Institution is required").max(200),
  department: z.string().min(2, "Department is required").max(150),
  designation: z.string().min(2, "Designation is required").max(150),
  employeeId: z.string().trim().max(100).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
  accessRequestReason: z
    .string()
    .min(10, "Please provide a short reason (at least 10 characters)")
    .max(2000),
});
export type RequestExaminerAccessInput = z.infer<typeof requestExaminerAccessSchema>;

export const rejectExaminerRequestSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
export type RejectExaminerRequestInput = z.infer<typeof rejectExaminerRequestSchema>;

// ---------------------------------------------------------------------
// Public "View Request Status" lookup — applicant supplies EITHER the
// Request ID (the User.id returned when they submitted the request) OR
// their official email. At least one is required.
// ---------------------------------------------------------------------
export const examinerRequestStatusQuerySchema = z
  .object({
    requestId: z.string().trim().min(1).optional(),
    email: z.string().trim().email("Enter a valid email address").toLowerCase().optional(),
  })
  .refine((data) => Boolean(data.requestId || data.email), {
    message: "Provide either a Request ID or an email address",
    path: ["requestId"],
  });
export type ExaminerRequestStatusQuery = z.infer<typeof examinerRequestStatusQuerySchema>;

// ---------------------------------------------------------------------
// Public "Edit & Resubmit" — only allowed while the request is
// REJECTED. The request is identified by :requestId in the URL path
// (see adminExaminerRequest... no — auth.routes.ts); the body is just
// the same editable field set as the original request form. Password
// is intentionally NOT editable here — resubmitting only updates the
// application profile, not credentials.
// ---------------------------------------------------------------------
export const resubmitExaminerAccessRequestSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(150),
  institution: z.string().min(2, "Institution is required").max(200),
  department: z.string().min(2, "Department is required").max(150),
  designation: z.string().min(2, "Designation is required").max(150),
  employeeId: z.string().trim().max(100).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
  accessRequestReason: z
    .string()
    .min(10, "Please provide a short reason (at least 10 characters)")
    .max(2000),
});
export type ResubmitExaminerAccessRequestInput = z.infer<
  typeof resubmitExaminerAccessRequestSchema
>;
