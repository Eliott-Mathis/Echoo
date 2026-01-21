import fp from 'fastify-plugin';
import { Server as IOServer } from 'socket.io';
import { FastifyInstance } from 'fastify';

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
      const user = await fastify.auth.api.getSession(token)
      console.log(user)
      if (!user) return next(new Error('Unauthorized'));

      // Stocke l’utilisateur dans le socket pour l’utiliser plus tard
      (socket as any).user = user;
      next();
    } catch (err) {
        console.log(err)
      //next(err);
    }
  });

  io.on('connection', (socket) => {
    console.log('Utilisateur connecté:', (socket as any).user.id);

    socket.on('message', (msg) => {
      console.log(`Message de ${(socket as any).user.id}: ${msg}`);
      socket.emit('message', `Reçu: ${msg}`);
    });
  });

  // On sauvegarde l’instance io sur fastify pour y accéder ailleurs
  fastify.decorate('io', io);
});
