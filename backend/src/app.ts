import fastify, { FastifyError } from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import cookie from "@fastify/cookie";
import prismaPlugin from "./plugins/prisma";
import authPlugin from "./plugins/auth";
import socketPlugin from "./plugins/socket";
import signupRoutes from "./modules/auth/signup.routes";
import authRoutes from "./modules/auth/auth.routes";
import relationshipRoutes from "./modules/relationships/relationships.routes";

export const app = fastify({
  logger: true,
});

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

// cors policy
await app.register(cors, {
  origin: [clientOrigin],
  credentials: true,
});

await app.register(formbody);

app.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  parseOptions: {},
});

await app.register(prismaPlugin);
await app.register(authPlugin);
await app.register(socketPlugin);

// signup completion route
await app.register(signupRoutes, { prefix: "/auth" });

// Better Auth handler
await app.register(authRoutes)

// Relationships routes
await app.register(relationshipRoutes, { prefix: "/api/relationships" });

// Error hanlder
app.setErrorHandler((error: FastifyError, request, reply) => {
  request.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: "Une erreur est survenue",
  });
});
