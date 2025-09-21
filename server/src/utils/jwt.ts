import jwt from 'jsonwebtoken';
import { env } from "../env.js";

export type JwtPayload = { id: string };

export interface SignTokenOptions {
  expiresIn: number;
}

export function signToken(payload: JwtPayload, options: SignTokenOptions): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: options.expiresIn,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
