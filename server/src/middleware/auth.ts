import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyToken(token);
    (req as any).user = { id: payload.id };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    console.log('No token provided');
    return next();
  }
  try {
    const payload = verifyToken(token);
    (req as any).user = { id: payload.id };
  } catch {
    console.log('Invalid token, proceeding without user');
  }
  next();
}
