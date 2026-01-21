import { FastifyInstance } from "fastify";
import "dotenv/config";
import { fastifyToFetchRequest } from "../../helpers/http";

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        const req = fastifyToFetchRequest(request);
        // Process authentication request
        const response = await fastify.auth.handler(req);
        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value: string, key: string) =>
          reply.header(key, value),
        );
        reply.send(response.body ? await response.text() : null);
      } catch (error: any) {
        fastify.log.error("Authentication Error:", error);
        reply.status(500).send({
          error: error.message || "Internal Server Error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });
};
export default authRoutes;
