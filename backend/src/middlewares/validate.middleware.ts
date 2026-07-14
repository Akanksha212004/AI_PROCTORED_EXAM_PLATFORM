import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Validates `req.body` against a Zod schema and replaces it with the
 * parsed (and coerced/defaulted) value — equivalent of FastAPI
 * validating a Pydantic model as an endpoint parameter.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({ detail: result.error.issues });
    }
    req.body = result.data;
    next();
  };
}