import { FastifyInstance } from "fastify";
import { PrismaClient } from "../../generated/prisma/client";
import { JSONSchemaType } from "ajv";
import { HttpError } from "../../helpers/HttpError";
import { AuthService } from "./auth.service";

// Validations
import {
  CreateUserBody,
  createUserSchema,
  LoginUserBody,
  loginUserSchema,
  sendValidationCodeSchema,
  SendValidationCodeToEmail,
} from "./auth.schema";

export default async function userRoutes(fastify: FastifyInstance) {
  const service = new AuthService(fastify.db);

  fastify.post<{ Body: SendValidationCodeToEmail}>("/email-verification", { schema: { body: sendValidationCodeSchema}},
    async (request, reply) => {
      const userExists = await service.userExists(request.body.email)

      if(userExists) throw new HttpError(409, "An account already exists with this email");

      // send email code verification

      return reply.code(200).send({ok: true})
    }
  )

  fastify.post<{ Body: CreateUserBody }>("/signup", { schema: { body: createUserSchema }, },
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
        }).send({ok: true})
    }
  );

  fastify.post<{ Body: LoginUserBody }>("/login", { schema: { body: loginUserSchema }, },
    async (request, reply) => {
      const token = await service.login(request.body);
      
      return reply
        .code(200)
        .setCookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 7
        }).send({ok: true})
    }
  );
}
