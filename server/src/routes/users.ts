import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const usersRouter = Router();

/**
 * POST /api/users/:id/follow -> toggle follow
 */
usersRouter.post('/users/:id/follow', requireAuth, async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId) || targetId <= 0)
      return res.status(400).json({ error: 'Invalid user id' });
    if (targetId === req.user!.id)
      return res.status(400).json({ error: 'Cannot follow yourself' });

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: String(req.user!.id),
          followingId: String(targetId),
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return res.json({ following: false });
    } else {
      await prisma.follow.create({
        data: { followerId: String(req.user!.id), followingId: String(targetId) },
      });
      return res.json({ following: true });
    }
  } catch (e) {
    console.log('Error toggling follow:', e);
    next(e);
  }
});
