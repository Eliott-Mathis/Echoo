
import fp from "fastify-plugin";
import type { betterAuth } from "better-auth";
import auth from "../lib/auth";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    auth: ReturnType<typeof auth>;
  }
}

export default fp(async (fastify) => {
  // prisma db instance
  const db = fastify.db;
  
  fastify.decorate("auth", auth(db));
});
