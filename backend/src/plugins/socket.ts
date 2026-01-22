import fp from 'fastify-plugin';
import { Server as IOServer, Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { fastifyHeadersToFetchHeaders } from '../helpers/http';

const onlineUsers = new Map<string, Set<Socket>>();
const messageRateLimits = new Map<string, { lastSentAt: number }>();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const MAX_MESSAGE_LENGTH = 4000;
const MIN_MESSAGE_INTERVAL_MS = 250;

type MessageType = 'error' | 'success';

interface SocketMessageType {
  type: MessageType;
  message: string;
}

type SocketAck<T> = (res: { type: MessageType; message?: string; data?: T }) => void;

type DmMessagePayload = {
  id: string;
  conversationId: string;
  content: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
};

const addUserSocket = (userId: string, socket: Socket) => {
  const existing = onlineUsers.get(userId);
  if (existing) {
    existing.add(socket);
    return;
  }

  onlineUsers.set(userId, new Set([socket]));
};

const removeUserSocket = (userId: string, socket: Socket) => {
  const existing = onlineUsers.get(userId);
  if (!existing) return;
  existing.delete(socket);
  if (existing.size === 0) onlineUsers.delete(userId);
};

const mapMessagePayload = (message: any): DmMessagePayload => ({
  id: message.id,
  conversationId: message.conversationId,
  content: message.content,
  createdAt: message.createdAt.toISOString(),
  author: {
    id: message.author.id,
    username: message.author.username,
    displayName: message.author.displayName,
    avatarUrl: message.author.avatarUrl ?? null,
  },
});

export default fp(async (fastify: FastifyInstance) => {
  const io = new IOServer(fastify.server, {
    cors: {
      origin: CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const headers = fastifyHeadersToFetchHeaders(socket.handshake.headers as any);
      const authToken = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : undefined;

      if (authToken && !headers.has('authorization')) {
        headers.set('authorization', `Bearer ${authToken}`);
      }

      const session = await fastify.auth.api.getSession({ headers });
      if (!session?.user) return next(new Error('Unauthorized'));

      socket.data.userId = session.user.id;
      addUserSocket(session.user.id, socket);
      next();
    } catch (err) {
      fastify.log.error(err);
      next(err as Error);
    }
  });

  io.on('connection', (socket) => {
    fastify.log.info({ userId: socket.data.userId }, 'Socket connected');

    socket.on('dm:open', async (data: { username?: string }, ack: SocketAck<{ conversationId: string; recipient: { id: string; username: string; displayName: string; avatarUrl: string | null }; messages: DmMessagePayload[] }>) => {
      try {
        const fromUserId = socket.data.userId as string;
        const username = data?.username?.trim();

        if (!username || username.length > 32) {
          return ack?.({ type: 'error', message: 'Username is required.' });
        }

        const recipient = await fastify.db.user.findUnique({
          where: { username },
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        });

        if (!recipient) {
          return ack?.({ type: 'error', message: 'User not found.' });
        }

        if (recipient.id === fromUserId) {
          return ack?.({ type: 'error', message: 'Cannot open a DM with yourself.' });
        }

        const conversation = await fastify.db.$transaction(async (tx) => {
          const existing = await tx.conversation.findFirst({
            where: {
              type: 'DM',
              members: {
                some: { userId: fromUserId, leftAt: null },
              },
              AND: {
                members: { some: { userId: recipient.id, leftAt: null } },
              },
            },
            select: { id: true },
          });

          if (existing) return existing;

          return tx.conversation.create({
            data: {
              type: 'DM',
              members: {
                create: [{ userId: fromUserId }, { userId: recipient.id }],
              },
            },
            select: { id: true },
          });
        });

        socket.join(conversation.id);

        const messages = await fastify.db.message.findMany({
          where: { conversationId: conversation.id, isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            author: {
              select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
        });

        const payload = messages.reverse().map(mapMessagePayload);

        return ack?.({
          type: 'success',
          data: {
            conversationId: conversation.id,
            recipient,
            messages: payload,
          },
        });
      } catch (error) {
        console.log(error);
        return ack?.({ type: 'error', message: 'Failed to open DM.' });
      }
    });

    socket.on('dm:send', async (data: { conversationId?: string; content?: string }, ack: SocketAck<{ message: DmMessagePayload }>) => {
      try {
        const fromUserId = socket.data.userId as string;
        const conversationId = data?.conversationId;
        const content = data?.content?.trim();

        if (!conversationId || !content) {
          return ack?.({ type: 'error', message: 'Message content is required.' });
        }

        if (content.length > MAX_MESSAGE_LENGTH) {
          return ack?.({ type: 'error', message: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` });
        }

        const rateLimit = messageRateLimits.get(socket.id);
        const now = Date.now();
        if (rateLimit && now - rateLimit.lastSentAt < MIN_MESSAGE_INTERVAL_MS) {
          return ack?.({ type: 'error', message: 'You are sending messages too quickly.' });
        }
        messageRateLimits.set(socket.id, { lastSentAt: now });

        const membership = await fastify.db.conversationMember.findFirst({
          where: { conversationId, userId: fromUserId, leftAt: null },
          select: { id: true },
        });

        if (!membership) {
          return ack?.({ type: 'error', message: 'Not a member of this conversation.' });
        }

        const message = await fastify.db.message.create({
          data: {
            conversationId,
            authorId: fromUserId,
            content,
            type: 'DEFAULT',
          },
          include: {
            author: {
              select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
        });

        await fastify.db.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: message.createdAt },
        });

        const payload = mapMessagePayload(message);

        io.to(conversationId).emit('dm:message', payload);

        return ack?.({ type: 'success', data: { message: payload } });
      } catch (error) {
        fastify.log.error(error);
        return ack?.({ type: 'error', message: 'Failed to send message.' });
      }
    });

    socket.on('sendFriendRequest', async (data, ack: (res: SocketMessageType) => void) => {
      try {
        const fromUserId = socket.data.userId as string;
        const toUser = typeof data?.toUser === 'string' ? data.toUser.trim() : '';

        if (!toUser || toUser.length > 32) {
          return ack?.({ type: 'error', message: 'Username is required.' });
        }

        const userToAdd = await fastify.db.user.findUnique({
          where: { username: toUser },
          select: { id: true },
        });

        if (!userToAdd) return ack?.({ type: 'error', message: 'The user was not found' });

        if (userToAdd.id === fromUserId) {
          return ack?.({ type: 'error', message: 'You cannot add yourself.' });
        }

        const existing = await fastify.db.relationship.findFirst({
          where: {
            OR: [
              { ownerId: fromUserId, targetId: userToAdd.id },
              { ownerId: userToAdd.id, targetId: fromUserId },
            ],
          },
          select: { id: true },
        });

        if (existing) return ack?.({ type: 'error', message: 'A request already exists.' });

        await fastify.db.relationship.create({
          data: {
            ownerId: fromUserId,
            targetId: userToAdd.id,
            type: 'PENDING',
          },
        });

        const userToAddSockets = onlineUsers.get(userToAdd.id);

        if (userToAddSockets) {
          userToAddSockets.forEach((userSocket) => {
            userSocket.emit('notification', { type: 'success', message: 'You received a friend request !' });
          });
        }

        return ack?.({ type: 'success', message: 'Your request has been sent successfully' });
      } catch (error) {
        fastify.log.error(error);
        return ack?.({ type: 'error', message: 'Failed to send friend request.' });
      }
    });
    socket.on('disconnect', () => {
      const userId = socket.data.userId as string | undefined;
      if (userId) {
        removeUserSocket(userId, socket);
      }
      messageRateLimits.delete(socket.id);
    });
  });

  // On sauvegarde l’instance io sur fastify pour y accéder ailleurs
  fastify.decorate('io', io);
});
