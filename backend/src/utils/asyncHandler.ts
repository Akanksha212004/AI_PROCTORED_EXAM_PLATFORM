import type { NextFunction, Request, Response } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express doesn't forward rejected promises to error middleware by
 * default. Wrapping every controller in this removes the need for a
 * try/catch in each one — same effect as FastAPI handling exceptions
 * raised inside `async def` endpoints automatically.
 */
export function asyncHandler(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
