import { PrismaClient } from "@prisma/client";
import type { BetterAuth } from "better-auth";

declare module "fastify" {
  interface FastifyInstance {
    db: PrismaClient;
    auth: BetterAuth;
  }
}
