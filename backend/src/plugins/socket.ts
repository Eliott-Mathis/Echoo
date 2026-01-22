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
    return false;
  }

  onlineUsers.set(userId, new Set([socket]));
  return true;
};

const removeUserSocket = (userId: string, socket: Socket) => {
  const existing = onlineUsers.get(userId);
  if (!existing) return false;
  existing.delete(socket);
  if (existing.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }
  return false;
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
  const updateUserPresence = async (userId: string, status: 'ONLINE' | 'OFFLINE') => {
    try {
      await fastify.db.user.update({
        where: { id: userId },
        data: {
          status,
          ...(status === 'OFFLINE' ? { lastOnlineAt: new Date() } : {}),
        },
      });
    } catch (error) {
      fastify.log.error(error);
    }
  };

  const getDmKey = (firstId: string, secondId: string) => [firstId, secondId].sort().join(':');

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
      const isFirstConnection = addUserSocket(session.user.id, socket);
      if (isFirstConnection) {
        await updateUserPresence(session.user.id, 'ONLINE');
      }
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

        const dmKey = getDmKey(fromUserId, recipient.id);

        const conversation = await fastify.db.$transaction(async (tx) => {
          let existing = await tx.conversation.findFirst({
            where: { type: 'DM', dmKey },
            select: { id: true, dmKey: true },
          });

          if (!existing) {
            existing = await tx.conversation.findFirst({
              where: {
                type: 'DM',
                members: {
                  some: { userId: fromUserId },
                },
                AND: {
                  members: { some: { userId: recipient.id } },
                },
              },
              select: { id: true, dmKey: true },
            });

            if (existing && !existing.dmKey) {
              await tx.conversation.update({
                where: { id: existing.id },
                data: { dmKey },
              });
            }
          }

          if (!existing) {
            existing = await tx.conversation.create({
              data: {
                type: 'DM',
                dmKey,
                members: {
                  create: [{ userId: fromUserId }, { userId: recipient.id }],
                },
              },
              select: { id: true, dmKey: true },
            });
          }

          await tx.conversationMember.upsert({
            where: { conversationId_userId: { conversationId: existing.id, userId: fromUserId } },
            update: { leftAt: null, isHidden: false },
            create: { conversationId: existing.id, userId: fromUserId },
          });

          return existing;
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
        const shouldMarkOffline = removeUserSocket(userId, socket);
        if (shouldMarkOffline) {
          updateUserPresence(userId, 'OFFLINE');
        }
      }
      messageRateLimits.delete(socket.id);
    });

    socket.on('dm:leave', async (data: { conversationId?: string }, ack: SocketAck<null>) => {
      try {
        const userId = socket.data.userId as string;
        const conversationId = data?.conversationId;

        if (!conversationId) {
          return ack?.({ type: 'error', message: 'Conversation id is required.' });
        }

        const membership = await fastify.db.conversationMember.findFirst({
          where: { conversationId, userId, leftAt: null },
          select: { id: true },
        });

        if (!membership) {
          return ack?.({ type: 'error', message: 'Not a member of this conversation.' });
        }

        await fastify.db.conversationMember.update({
          where: { id: membership.id },
          data: { leftAt: new Date(), isHidden: true },
        });

        socket.leave(conversationId);

        return ack?.({ type: 'success' });
      } catch (error) {
        fastify.log.error(error);
        return ack?.({ type: 'error', message: 'Failed to leave conversation.' });
      }
    });
  });

  // On sauvegarde l’instance io sur fastify pour y accéder ailleurs
  fastify.decorate('io', io);
});
