import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(422).json({ detail: result.error.issues });
    }

    // Store validated query separately
    (req as any).validatedQuery = result.data;

    next();
  };
}