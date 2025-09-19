import { prisma } from '../prisma.js';
type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW';
import { io } from '../socket.js';

export async function createNotification(opts: {
  userId: number; // кому
  actorId: number; // кто
  type: NotificationType;
  postId?: number;
}) {
  if (opts.userId === opts.actorId) return null; // не уведомляем самого себя
  const notif = await prisma.notification.create({
    data: {
      userId: opts.userId,
      actorId: opts.actorId,
      type: opts.type,
      postId: opts.postId,
    },
  });
  // пушим realtime
  io.to(`user:${opts.userId}`).emit('notification', {
    id: notif.id,
    type: notif.type,
    actorId: notif.actorId,
    postId: notif.postId,
    createdAt: notif.createdAt,
  });
  return notif;
}