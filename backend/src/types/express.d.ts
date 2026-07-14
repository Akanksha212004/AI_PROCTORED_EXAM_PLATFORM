import type { User } from "@prisma/client";

// Augments Express's Request type so `req.user` is typed everywhere
// after the `authenticate` middleware runs — equivalent of FastAPI's
// `current_user: User = Depends(get_current_user)`.
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
