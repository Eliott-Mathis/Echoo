import fp from 'fastify-plugin';
import { Server as IOServer, Socket } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { fastifyHeadersToFetchHeaders } from '../helpers/http';

const onlineUsers = new Map<string, Socket>();

type MessageType = "error" | "success"

interface SocketMessageType {
    type: MessageType,
    message: string
}

export default fp(async (fastify: FastifyInstance) => {
  const io = new IOServer(fastify.server, {
    cors: {
      origin: '*', // adapter selon ton front
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Unauthorized'));

      // Vérifie le token avec BetterAuth
      const headers = fastifyHeadersToFetchHeaders(
        socket.handshake.headers as any,
      );

      headers.set('authorization', `Bearer ${token}`);

      const session = await fastify.auth.api.getSession({ headers });
      if (!session?.user) return next(new Error('Unauthorized'));

      // Stocke l’utilisateur dans le socket pour l’utiliser plus tard
      (socket as any).userId = session.user.id;
      onlineUsers.set(session.user.id, socket)
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

    socket.on('sendFriendRequest', async (data, ack : (res: SocketMessageType) => void) => {
        const fromUserId = (socket as any).userId
        const { toUserId } = JSON.parse(data);

        // get user socket
        const userToAddSocket = onlineUsers.get(toUserId);

        // find user in db
        const userToAdd = await fastify.db.user.findUnique({ where: {id: toUserId}})

        if(!userToAdd) return ack?.({type: 'error', message: 'The user was not found' })

        // create friend request 
        await fastify.db.relationship.create({ data: {
            ownerId: fromUserId,
            targetId: toUserId,
            type: 'PENDING'
        }})

        // send notification to second user
        if(userToAddSocket) userToAddSocket.send({type: 'success', message: 'You received a friend request !'})

        // return success to sender
        return ack?.({type: 'success', message: "Your request has been sent successfully"})
    })
  });

  // On sauvegarde l’instance io sur fastify pour y accéder ailleurs
  fastify.decorate('io', io);
});
