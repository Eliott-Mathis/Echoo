import fastify, { FastifyError } from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import cookie from "@fastify/cookie";
import prismaPlugin from "./plugins/prisma";
import { auth } from "./lib/auth";
import signupRoutes from "./modules/auth/signup.routes";

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
app.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  parseOptions: {},
});

// signup completion route
await app.register(signupRoutes, { prefix: "/auth" });

// Better Auth handler
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = new Headers();

      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      const contentType = request.headers["content-type"]?.toString() ?? "";
      const hasBody = request.body !== undefined && request.body !== null;
      let body: BodyInit | undefined;

      if (hasBody) {
        if (typeof request.body === "string" || request.body instanceof Buffer) {
          body = request.body as BodyInit;
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          body = new URLSearchParams(request.body as Record<string, string>);
        } else {
          body = JSON.stringify(request.body);
        }
      }

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(body ? { body } : {}),
      });

      const response = await auth.handler(req);

      reply.status(response.status);
      response.headers.forEach((value: string, key: string) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error({ err: error }, "Authentication Error");
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

// Error hanlder
app.setErrorHandler((error: FastifyError, request, reply) => {
  reply.status(error.statusCode || 400).send({
    error: "Une erreur est survenue",
  });
});
