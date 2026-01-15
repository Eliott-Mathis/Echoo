import { FastifyInstance } from "fastify";
import { PrismaClient } from "../../generated/prisma/client";
import { JSONSchemaType } from "ajv";
import { AuthService } from "./auth.service";
import { CreateUserBody, createUserSchema } from "./auth.schema";

export default async function userRoutes(fastify: FastifyInstance) {
}
