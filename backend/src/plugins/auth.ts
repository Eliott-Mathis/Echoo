
import fp from "fastify-plugin";
import type { betterAuth } from "better-auth";
import { auth} from "../lib/auth";
import { FastifyInstance } from "fastify";



export default fp(async (fastify) => {
  // prisma db instance
  const db = fastify.db;
  
  fastify.decorate("auth", auth(db));
});
