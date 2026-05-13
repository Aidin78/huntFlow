import type { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../lib/jwt';
import { sendError } from '../lib/errors';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    sendError(res, 401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
    return;
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    sendError(res, 401, 'UNAUTHORIZED', 'Missing bearer token');
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}
