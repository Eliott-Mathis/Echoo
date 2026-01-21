import { FastifyInstance } from "fastify";
import { RelationshipType } from "../../generated/prisma/client";
import { fastifyHeadersToFetchHeaders } from "../../helpers/http";

export default async function relationshipRoutes(fastify: FastifyInstance) {
  fastify.get("/pending-count", async (request, reply) => {
    const headers = fastifyHeadersToFetchHeaders(request.headers);
    const session = await fastify.auth.api.getSession({ headers });

    if (!session?.user?.id) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const pendingCount = await fastify.db.relationship.count({
      where: {
        ownerId: session.user.id,
        type: RelationshipType.PENDING,
      },
    });

    return reply.send({ pendingCount });
  });
}
