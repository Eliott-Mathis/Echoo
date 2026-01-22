import fp from 'fastify-plugin';
import { Server as IOServer, Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { fastifyHeadersToFetchHeaders } from '../helpers/http';

const onlineUsers = new Map<string, Set<Socket>>();

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
      origin: 'http://localhost:5173', // adapter selon ton front
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.request.headers['cookie'];
      console.log('Token, ', token);

      if (!token) return next(new Error('Unauthorized'));

      // Vérifie le token avec BetterAuth
      const headers = fastifyHeadersToFetchHeaders(socket.handshake.headers as any);

      headers.set('authorization', `Bearer ${token}`);

      const session = await fastify.auth.api.getSession({ headers });
      if (!session?.user) return next(new Error('Unauthorized'));

      (socket as any).userId = session.user.id;
      addUserSocket(session.user.id, socket);
      next();
    } catch (err) {
      console.log(err);
      next(err as Error);
    }
  });

  io.on('connection', (socket) => {
    console.log('Utilisateur connecté:', (socket as any).userId);

    socket.on('message', (msg) => {
      console.log(`Message de ${(socket as any).userId}: ${msg}`);
      socket.emit('message', `Reçu: ${msg}`);
    });

    socket.on('dm:open', async (data: { username?: string }, ack: SocketAck<{ conversationId: string; recipient: { id: string; username: string; displayName: string; avatarUrl: string | null }; messages: DmMessagePayload[] }>) => {
      try {
        const fromUserId = (socket as any).userId as string;
        const username = data?.username?.trim();

        if (!username) {
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

        let conversation = await fastify.db.conversation.findFirst({
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

        if (!conversation) {
          conversation = await fastify.db.conversation.create({
            data: {
              type: 'DM',
              members: {
                create: [{ userId: fromUserId }, { userId: recipient.id }],
              },
            },
            select: { id: true },
          });
        }

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
        const fromUserId = (socket as any).userId as string;
        const conversationId = data?.conversationId;
        const content = data?.content?.trim();

        if (!conversationId || !content) {
          return ack?.({ type: 'error', message: 'Message content is required.' });
        }

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
        console.log(error);
        return ack?.({ type: 'error', message: 'Failed to send message.' });
      }
    });

    socket.on('sendFriendRequest', async (data, ack: (res: SocketMessageType) => void) => {
      const fromUserId = (socket as any).userId;
      const { toUser } = data;

      // find user in db
      const userToAdd = await fastify.db.user.findUnique({ where: { username: toUser } });

      if (!userToAdd) return ack?.({ type: 'error', message: 'The user was not found' });

      // get user socket
      const userToAddSockets = onlineUsers.get(userToAdd.id);

      // this relationship already exists ?
      const relationship = await fastify.db.relationship.findFirst({
        where: {
          ownerId: fromUserId || userToAdd.id,
        },
      });

      if (relationship) return ack?.({ type: 'error', message: 'A request has already been sent' });

      // create friend request
      await fastify.db.relationship.create({
        data: {
          ownerId: fromUserId,
          targetId: userToAdd.id,
          type: 'PENDING',
        },
      });

      // send notification to second user
      if (userToAddSockets) {
        userToAddSockets.forEach((userSocket) => {
          userSocket.emit('notification', { type: 'success', message: 'You received a friend request !' });
        });
      }

      // return success to sender
      return ack?.({ type: 'success', message: 'Your request has been sent successfully' });
    });
    socket.on('disconnect', () => {
      const userId = (socket as any).userId as string | undefined;
      if (userId) {
        removeUserSocket(userId, socket);
      }
    });
  });

  // On sauvegarde l’instance io sur fastify pour y accéder ailleurs
  fastify.decorate('io', io);
});
