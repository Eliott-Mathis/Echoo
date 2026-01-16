import { FastifyInstance } from "fastify";
import { PrismaClient } from "../../generated/prisma/client";
import { JSONSchemaType } from "ajv";
import { AuthService } from "./auth.service";
import { CreateUserBody, createUserSchema } from "./auth.schema";

export default async function userRoutes(fastify: FastifyInstance) {
  const service = new AuthService(fastify.db);

  fastify.post<{ Body: CreateUserBody }>(
    "/sign-up",
    {
      schema: { body: createUserSchema },
    },
    async (request, reply) => {
      const result = await service.signUp(request.body);
      return reply
        .code(200)
        .setCookie("token", result, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
        .send(result);
    }
  );
}
