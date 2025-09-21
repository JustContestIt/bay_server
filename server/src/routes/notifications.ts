import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationsRouter = Router();

/**
 * GET /api/notifications
 */
notificationsRouter.get(
  '/notifications',
  requireAuth,
  async (req, res, next) => {
    try {
      const notifs = await prisma.notification.findMany({
        where: { userId: String(req.user!.id) },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          actor: { select: { id: true, username: true, displayName: true } },
        },
      });
      return res.json(
        notifs.map((n: { id: any; type: any; actor: any; postId: any; createdAt: any; read: any; }) => ({
          id: n.id,
          type: n.type,
          actor: n.actor,
          postId: n.postId,
          createdAt: n.createdAt,
          read: n.read,
        }))
      );
    } catch (e) {
      console.log('Error fetching notifications:', e);
      next(e);
    }
  }
);
