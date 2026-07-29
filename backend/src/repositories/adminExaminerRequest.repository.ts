// src/repositories/adminExaminerRequest.repository.ts
//
// ONLY Prisma operations live here, scoped to EXAMINER accounts and
// their approvalStatus — the admin's "Pending Examiner Requests" queue.
// Mirrors the shape of adminUser.repository.ts.

import type { User } from "@prisma/client";

import { prisma } from "../db/prisma";

const EXAMINER_REQUEST_SELECT = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  approvalStatus: true,
  institution: true,
  department: true,
  designation: true,
  employeeId: true,
  yearsOfExperience: true,
  accessRequestReason: true,
  rejectionReason: true,
  createdAt: true,
} as const;

export async function countByStatus(status: "PENDING" | "APPROVED" | "REJECTED"): Promise<number> {
  return prisma.user.count({ where: { role: "EXAMINER", approvalStatus: status } });
}

export async function findByStatus(
  status: "PENDING" | "APPROVED" | "REJECTED",
  skip: number,
  take: number
) {
  return prisma.user.findMany({
    where: { role: "EXAMINER", approvalStatus: status },
    select: EXAMINER_REQUEST_SELECT,
    orderBy: { createdAt: "asc" },
    skip,
    take,
  });
}

export async function findExaminerById(id: string): Promise<User | null> {
  return prisma.user.findFirst({ where: { id, role: "EXAMINER" } });
}

export async function approve(id: string): Promise<User> {
  return prisma.user.update({
    where: { id },
    data: { approvalStatus: "APPROVED", rejectionReason: null },
  });
}

export async function reject(id: string, reason?: string): Promise<User> {
  return prisma.user.update({
    where: { id },
    data: { approvalStatus: "REJECTED", rejectionReason: reason ?? null },
  });
}
