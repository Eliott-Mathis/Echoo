import fastify from "fastify";
import prismaPlugin from "./plugins/prisma";

export const app = fastify({
  logger: true,
});

await app.register(prismaPlugin);
