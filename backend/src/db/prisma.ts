/**
 * Single shared Prisma client — the Node equivalent of the SQLAlchemy
 * `SessionLocal` / `get_db` pattern. Every repository imports this
 * instead of instantiating its own client, which avoids exhausting
 * database connections in development (hot-reload) and production.
 */
import { PrismaClient } from "@prisma/client";

import { env } from "../core/config";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
