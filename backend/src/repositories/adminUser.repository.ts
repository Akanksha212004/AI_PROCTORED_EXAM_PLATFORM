// src/repositories/adminUser.repository.ts
//
// ONLY Prisma operations live here. Unlike user.repository.ts (auth/profile
// lookups for the current user) or student.repository.ts (students scoped
// to one examiner's exams), every query here spans every account on the
// platform regardless of role — this is the admin's user directory.

import type { Prisma, Role, User } from "@prisma/client";

import { prisma } from "../db/prisma";
import { hashPassword } from "../core/security";

interface UserFilters {
  search?: string;
  role?: Role;
  isActive?: boolean;
}

function userWhere({ search, role, isActive }: UserFilters): Prisma.UserWhereInput {
  return {
    ...(role ? { role } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function countUsers(filters: UserFilters): Promise<number> {
  return prisma.user.count({ where: userWhere(filters) });
}

export async function findUsers(filters: UserFilters, skip: number, take: number) {
  return prisma.user.findMany({
    where: userWhere(filters),
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

/** Number of exams each of these examiners/admins has created, keyed by user id. */
export async function countExamsCreatedByIds(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.exam.groupBy({
    by: ["createdById"],
    where: { createdById: { in: userIds } },
    _count: { _all: true },
  });
  return new Map(rows.filter((r) => r.createdById !== null).map((r) => [r.createdById as string, r._count._all]));
}

/** Number of exam sessions each of these students has started, keyed by student id. */
export async function countSessionsByStudentIds(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.examSession.groupBy({
    by: ["studentId"],
    where: { studentId: { in: userIds } },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.studentId, r._count._all]));
}

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
    },
  });
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<User> {
  return prisma.user.update({ where: { id }, data: { isActive } });
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  return prisma.user.update({ where: { id }, data: { role } });
}

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}
