import type { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import cookie from 'cookie';
import { verifyToken } from './utils/jwt.js';
import { env } from './env.js';

export let io: Server;

export function initSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookiesHeader = socket.handshake.headers.cookie || '';
      const cookies = cookie.parse(cookiesHeader);
      const token = cookies['token'];
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyToken(token);
      (socket.data as any).userId = payload.id;
      return next();
    } catch (e) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket.data as any).userId as number;
    socket.join(`user:${userId}`);
    socket.on('disconnect', () => {
      // noop
    });
  });

  return io;
}
