import type { Request, Response } from "express";

import { toUserRead } from "../../../utils/serializeUser";

export function getCurrentUser(req: Request, res: Response) {
  // `req.user` is guaranteed by the `authenticate` middleware that runs before this.
  res.status(200).json(toUserRead(req.user!));
}
