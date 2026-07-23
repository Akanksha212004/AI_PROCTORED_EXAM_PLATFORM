// src/repositories/notification.repository.ts
//
// ONLY Prisma operations live here. The actual "what happened recently"
// data is already queried by dashboardSummary.repository.ts (recent
// questions/exams/submissions/gradings) — this file only owns the
// per-user "last seen" bookkeeping so we don't duplicate those queries.

import { prisma } from "../db/prisma";

export async function getNotificationsSeenAt(userId: string): Promise<Date | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationsSeenAt: true },
  });
  return user?.notificationsSeenAt ?? null;
}

export async function markNotificationsSeenNow(userId: string): Promise<Date> {
  const seenAt = new Date();
  await prisma.user.update({
    where: { id: userId },
    data: { notificationsSeenAt: seenAt },
  });
  return seenAt;
}
