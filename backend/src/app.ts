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

// cors policy
await app.register(cors, {
  origin: ["http://localhost:5173"],
  credentials: true,
})

await app.register(formbody);

await app.register(prismaPlugin);
await app.register(authPlugin)
await app.register(socketPlugin)

app.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  parseOptions: {},
});

// signup completion route
await app.register(signupRoutes, { prefix: "/auth" });

// Better Auth handler
await app.register(authRoutes)

// Relationships routes
await app.register(relationshipRoutes, { prefix: "/api/relationships" });

// Error hanlder
app.setErrorHandler((error: FastifyError, request, reply) => {
  reply.status(error.statusCode || 400).send({
    error: "Une erreur est survenue",
  });
});
