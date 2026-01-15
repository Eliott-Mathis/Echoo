import fastify, { FastifyError } from "fastify";
import cookie from "@fastify/cookie";
import prismaPlugin from "./plugins/prisma";

// Routes
import userRoutes from "./modules/auth/auth.routes";

export const app = fastify({
  logger: true,
});

await app.register(prismaPlugin);
app.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  parseOptions: {},
});

// routing
await app.register(userRoutes, { prefix: "/auth" });

// Error hanlder
app.setErrorHandler((error: FastifyError, request, reply) => {
  reply.status(error.statusCode || 400).send({
    error: "Une erreur est survenue",
  });
});
