import fp from "fastify-plugin";
import { PrismaClient } from "../generated/prisma/client";
import fastify, { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  // prisma db instance
  const db = new PrismaClient();

  await db.$connect();

  fastify.decorate("db", db);

  fastify.addHook("onClose", async (fastify) => {
    await fastify.prisma.$disconnect();
  });
});
