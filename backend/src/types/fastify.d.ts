import { PrismaClient } from '@prisma/client';
import type { Server as IOServer } from 'socket.io';
import type { BetterAuth } from 'better-auth';

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient;
    auth: BetterAuth;
    io: IOServer;
  }
}
