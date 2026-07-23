// import type { Request, Response } from "express";

// import { toUserRead } from "../../../utils/serializeUser";

// export function getCurrentUser(req: Request, res: Response) {
//   // `req.user` is guaranteed by the `authenticate` middleware that runs before this.
//   res.status(200).json(toUserRead(req.user!));
// }




import type { Request, Response } from "express";

import { toUserRead } from "../../../utils/serializeUser";
import { userService } from "../../../services/user.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export function getCurrentUser(req: Request, res: Response) {
  // `req.user` is guaranteed by the `authenticate` middleware that runs before this.
  res.status(200).json(toUserRead(req.user!));
}

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const updated = await userService.updateProfile(req.user!.id, req.body);
  res.status(200).json(updated);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.changePassword(req.user!.id, req.body);
  res.status(200).json(result);
});