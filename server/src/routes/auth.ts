import { Router } from 'express';
import { prisma } from '../prisma.js';
import { RegisterSchema } from '../validators.js';
import { signToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

/**
 * POST /api/users/register { username, displayName? } -> sets HttpOnly cookie
 */
authRouter.post('/users/register', async (req, res, next) => {
  try {
    const { username, displayName } = RegisterSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { username } });
    const user = existing
      ? existing
      : await prisma.user.create({
          data: { username, displayName },
        });

    const token = signToken({ id: user.id }, { expiresIn: 1210000 * 24 * 7 });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      createdAt: user.createdAt,
    });
  } catch (e) {
    console.log(e);    
    next(e);
  }
});

/**
 * GET /api/me -> current user
 */
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: String(req.user!.id) },
    });
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({
      id: me.id,
      username: me.username,
      displayName: me.displayName,
      bio: me.bio,
      createdAt: me.createdAt,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/users/login { username } -> sets HttpOnly cookie
 */
authRouter.post('/users/login', async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid username' });

    const token = signToken({ id: user.id }, { expiresIn: 1210000 * 24 * 7 });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      createdAt: user.createdAt,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/users/logout -> clears HttpOnly cookie
 */
authRouter.post('/users/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ message: 'Logged out' });
});
