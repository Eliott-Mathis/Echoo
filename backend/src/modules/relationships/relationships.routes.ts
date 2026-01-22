import { FastifyInstance } from 'fastify';
import { RelationshipType } from '../../generated/prisma/client';
import { fastifyHeadersToFetchHeaders } from '../../helpers/http';

const userRoom = (userId: string) => `user:${userId}`;

export default async function relationshipRoutes(fastify: FastifyInstance) {
  fastify.get('/pending-count', async (request, reply) => {
    const headers = fastifyHeadersToFetchHeaders(request.headers);
    const session = await fastify.auth.api.getSession({ headers });

    if (!session?.user?.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const pendingCount = await fastify.db.relationship.count({
      where: {
        targetId: session.user.id,
        type: RelationshipType.PENDING,
      },
    });

    return reply.send({ pendingCount });
  });

  fastify.get('/pending', async (request, reply) => {
    const headers = fastifyHeadersToFetchHeaders(request.headers);
    const session = await fastify.auth.api.getSession({ headers });

    if (!session?.user?.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const pending = await fastify.db.relationship.findMany({
      where: {
        targetId: session.user.id,
        type: RelationshipType.PENDING,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            status: true,
            customStatus: true,
          },
        },
      },
    });

    return reply.send({ pending });
  });

  fastify.get('/friends', async (request, reply) => {
    const headers = fastifyHeadersToFetchHeaders(request.headers);
    const session = await fastify.auth.api.getSession({ headers });

    if (!session?.user?.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const friends = await fastify.db.relationship.findMany({
      where: {
        ownerId: session.user.id,
        type: RelationshipType.FRIENDS,
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        target: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            status: true,
            customStatus: true,
          },
        },
      },
    });

    return reply.send({ friends: friends.map((item) => item.target) });
  });

  fastify.post('/accept', async (request, reply) => {
    const headers = fastifyHeadersToFetchHeaders(request.headers);
    const session = await fastify.auth.api.getSession({ headers });

    if (!session?.user?.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { userId } = request.body as { userId?: string };
    if (!userId) {
      return reply.status(400).send({ error: 'User id is required' });
    }

    if (userId === session.user.id) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    const result = await fastify.db.$transaction(async (tx) => {
      const incoming = await tx.relationship.findUnique({
        where: { ownerId_targetId: { ownerId: userId, targetId: session.user.id } },
      });

      if (!incoming || incoming.type !== RelationshipType.PENDING) {
        return { status: 'not-found' as const };
      }

      await tx.relationship.upsert({
        where: { ownerId_targetId: { ownerId: userId, targetId: session.user.id } },
        update: { type: RelationshipType.FRIENDS },
        create: { ownerId: userId, targetId: session.user.id, type: RelationshipType.FRIENDS },
      });

      await tx.relationship.upsert({
        where: { ownerId_targetId: { ownerId: session.user.id, targetId: userId } },
        update: { type: RelationshipType.FRIENDS },
        create: { ownerId: session.user.id, targetId: userId, type: RelationshipType.FRIENDS },
      });

      const friend = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          status: true,
          customStatus: true,
        },
      });

      return { status: 'accepted' as const, friend };
    });

    if (result.status !== 'accepted' || !result.friend) {
      return reply.status(404).send({ error: 'Request not found' });
    }

    fastify.io.to(userRoom(session.user.id)).emit('friend:list-updated');
    fastify.io.to(userRoom(userId)).emit('friend:list-updated');
    fastify.io.to(userRoom(session.user.id)).emit('friend:pending-updated');
    fastify.io.to(userRoom(userId)).emit('friend:pending-updated');

    return reply.send({ friend: result.friend });
  });

  fastify.post('/decline', async (request, reply) => {
    const headers = fastifyHeadersToFetchHeaders(request.headers);
    const session = await fastify.auth.api.getSession({ headers });

    if (!session?.user?.id) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { userId } = request.body as { userId?: string };
    if (!userId) {
      return reply.status(400).send({ error: 'User id is required' });
    }

    await fastify.db.relationship.deleteMany({
      where: {
        ownerId: userId,
        targetId: session.user.id,
        type: RelationshipType.PENDING,
      },
    });

    fastify.io.to(userRoom(session.user.id)).emit('friend:pending-updated');
    fastify.io.to(userRoom(userId)).emit('friend:pending-updated');

    return reply.send({ ok: true });
  });
}
