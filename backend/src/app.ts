import fastify, { FastifyError } from "fastify";
import prismaPlugin from "./plugins/prisma";
import userRoutes from "./modules/auth/auth.routes";

export const app = fastify({
  logger: true,
});

await app.register(prismaPlugin);

// routing
await app.register(userRoutes, { prefix: "/auth" });

// Error hanlder
