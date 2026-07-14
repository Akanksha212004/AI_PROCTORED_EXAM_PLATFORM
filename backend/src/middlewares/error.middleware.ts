import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";

import { ApiError } from "../utils/apiError";
import { env } from "../core/config";

/**
 * Equivalent of `app/middlewares/exception_handlers.py`. Registered
 * LAST in `app.ts` so Express routes every thrown/forwarded error here.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ detail: err.message });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ detail: err.message });
  }
  if (err instanceof Error && err.message.startsWith("Only PNG")) {
    return res.status(400).json({ detail: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return res.status(409).json({ detail: "Resource already exists" });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({
    detail: env.NODE_ENV === "development" ? String(err) : "Internal server error",
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ detail: "Route not found" });
}
