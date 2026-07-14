/**
 * Repository layer — the Node equivalent of `app/repositories/user_repository.py`.
 * This is the ONLY place that runs Prisma queries against `User`.
 * Services call into this instead of touching `prisma` directly.
 */
import type { Role, User } from "@prisma/client";

import { prisma } from "../db/prisma";
import { hashPassword } from "../core/security";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export const userRepository = {
  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  async create(input: CreateUserInput): Promise<User> {
    const passwordHash = await hashPassword(input.password);
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
      },
    });
  },
};
