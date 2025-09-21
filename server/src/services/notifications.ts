import { prisma } from '../prisma.js';
type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW';
import { io } from '../socket.js';

export async function createNotification(opts: {
  userId: string; // кому
  actorId: string; // кто
  type: NotificationType;
  postId?: string;
}) {
  if (opts.userId === opts.actorId) return null; // не уведомляем самого себя
  const notif = await prisma.notification.create({
    data: {
      userId: String(opts.userId),
      actorId: String(opts.actorId),
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